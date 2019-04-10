Package.describe({
  name: 'nazariistrohush:pure-meteor-react',
  version: '1.0.3',
  summary: 'Optimized react meteor data',
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