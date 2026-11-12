module.exports = (api) => {
  // Jest (NODE_ENV=test) needs CommonJS; library builds keep ES modules.
  const modules = api.env('test') ? 'commonjs' : undefined;

  return {
    presets: [['module:react-native-builder-bob/babel-preset', { modules }]],
  };
};
