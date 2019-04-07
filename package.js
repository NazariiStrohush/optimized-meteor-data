Package.describe({
  name: 'optimized-react-meteor-data',
  version: '1.0.1',
  summary: 'HOC which using withTracker BUT provide ability to return previous result and prevent useless cascade calculations',
  git: 'https://github.com/NazariiStrohush/optimized-react-meteor-data',
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