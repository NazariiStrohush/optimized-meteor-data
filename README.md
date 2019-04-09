## Syntax
```js
  pureWithTracker(
    shouldForceRefetchData: boolean | (prevProps: Object, nextProps: Object, prevResult: any) => boolean,
    trackerCallback: (props: Object, prevResult: any) => Object,
  ): HigherOrderComponent,
```

## Example

```js
import { pureWithTracker } from 'meteor/nazariistrohush:pure-meteor-react';

pureWithTracker(
  (props, nextProps, prevResult) => {
    // return true or false here to force rerun callback with reactive calculations (second pureWithTracker param)
  },
  (props, prevResult) => {
    // function with reactive data fetching/calculations
    // return object with new props for next/wrapped component
  },
);
```

## Short description

Use this package to provide reactive wrapper (HOC) for your meteor component with ability to return previous result and prevent useless cascade calculations.

## Which problems we have using withTracker?

Saying briefly - `withTracker` force reruns all reactive stuff inside, after receiving new props.

Let's imagine that we have component to represent user profile:
```js
const AvatarComponent = ({ url }) => <img src={url} />;
const UserProfilePage = ({ profile, organizations, projects, posts }) => (
  <div>
    <h2>User profile</h2>
    <AvatarComponent url={profile.protoUrl} />
    <div>Username: {profile.username}</div>
    <h3>Organizations</h3>
    <div>
      {organizations.map(org => <div key={org._id}>{org.name}</div>)}
    </div>
    <h3>Projects</h3>
    <div>
      {projects.map(project => <div key={project._id}>{project.name}</div>)}
    </div>
    <h3>Posts</h3>
    <div>
      {posts.map(post=> <div key={post._id}>{post.name}</div>)}
    </div>
  </div>
);
```

To support reactivity there we need to wrap component into container which will pass reactive data from collections or another reactive sources into component.

One of solutions is using `withTracker` HOC which allows you to pass callback with all reactive sources which will rerun when something changed in that sources.
```js
import Users from '/api/users';
import Projects from '/api/projects';
import Posts from '/api/posts';
import Organizations from '/api/organizations';

import { withTracker } from 'meteor/react-meteor-data';

const enhancer = withTracker((props) => {
  const { userId } = props;

  const profile = Users.findOne({ userId });
  const projects = Projects.find({ userId }).fetch();
  const posts = Posts.find({ userId }).fetch();
  const organizations = Organizations.find({ userId }).fetch();

  return { profile, organizations, projects, posts };
});

export default enhancer(UserProfilePage);
```

Reactivity works **but** it will rerun **every time** when something changed in just **one** of collections.

For example when some organization will be added/changed/removed from **organizations** array it will rerun our callback and make request to database for projects, posts, and profile which is **totally** useless here and will cause performance issues.

According to this let's split database requests by separate `withTracker`'s with `compose` to avoid useless refething of 
`Users` collection when `Organizations`, `Posts`, `Projects` changed.
We will have the next sequence:
 
`Users` -> `Organizations` -> `Projects` -> `Posts` -> `UserProfile`

Where every next `withTracker` HOC depends on previous one, and doing **useless force update/refetch data**.

```js
import Users from '/api/users';
import Projects from '/api/users';
import Posts from '/api/users';
import Organizations from '/api/users';

import { withTracker } from 'meteor/react-meteor-data';
import { compose, renderNothing } from 'recompose';
// you can also use `lodash/flow`

const enhancer = compose(
  // Find user document in database
  withTracker(props => {
    const { userId } = props;
    const profile = Users.findOne({ userId });
    return { profile };
  }),
  // Find organizations
  withTracker((props) => {
    const { userId } = props;
    const organizations = Organizations.find({ userId }).fetch();
    return { organizations };
  }),
  // Find user projects
  withTracker(props => {
    const { _id: userId } = props;
    const projects = Projects.find({ userId }).fetch();
    return { projects };
  }),
  // Find posts which related to user projects
  withTracker(props => {
    const { userId, projects } = props;
    const projectIds = projects.map(p => p._id);
    const posts = Posts.find({ userId, projectId: { $in: projectIds } }).fetch();
    return { posts };
  }),
);

export default enhancer(UserProfilePage);
```

But we want to have dependency **only** between **Projects** and **Posts** and **don't force refetch** documents when something changed at higher level HOC.

In this case I've designed pureWithTracker which can return previous fetched value when we need it and avoid useless cascade dependencies where we don't need them.

```js
// ...
// old imports there ^^^
import _ from 'lodash';
import { pureWithTracker } from 'meteor/nazariistrohush:pure-meteor-react';

const enhancer = compose(
  // pass only reactive callback to act as withTracker by default
  pureWithTracker(
    props => {
      const { userId } = props;
      const profile = Users.findOne({ userId });
      return { profile };
    },
  ),
  // Find organizations
  pureWithTracker(
    false, // pass false to prevent refetch data caused by foreign components
    (props, actualData) => {
    // use "actualData" from previous data request when you need it
    const { userId } = props;
    const organizations = Organizations.find({ userId }).fetch();
    return { organizations };
  }),
  // Find user projects
  pureWithTracker(
    true,
    props => {
      const { userId } = props;
      const projects = Projects.find({ userId }).fetch();
      return { projects };
    }
  ),
  // Find posts which related to user projects
  pureWithTracker(
    // Deside in callback when you need to force update/refetch data or just return actualData
    (prevProps, nextProps, actualData) => {
      const prevProjects = prevProps.projects;
      const nextProjects = nextProps.projects;
      const projectsChanged = !_.isEquals(prevProjects, nextProjects);
      // return "true" when you want to force refetch data in callback below (like it ALWAYS doing withTracker)
      // returen "false" to return actual (previous fetched data) and not make force useless data request to db
      return projectsChanged;
    },
    props => {
      const { userId, projects } = props;
      const projectIds = projects.map(p => p._id);
      const posts = Posts.find({ userId, projectId: { $in: projectIds } }).fetch();
      return { posts };
    },
  ),
);

export default enhancer(UserProfilePage);
```

What we have in this case?
We made dependency only between **Projects** and **Posts**, and avoid useless refetching when higher order HOC will render.
