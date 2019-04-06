Package.describe({
  name: 'optimized-react-meteor-data',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'HOC which using withTracker BUT provide ability to return previous result and prevent useless cascade calculations',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/NazariiStrohush/optimized-react-meteor-data',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('tracker');
  api.use('ecmascript');
  api.mainModule('optimized-react-meteor-data.js');
});

Npm.depends({
  react: "16.0.0",
});