module.exports = function (api) {
  const presets = [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "targets": "> 1%, last 1 version, Safari > 8, IE 11"
      }
    ],
    "@babel/preset-react",
    "@babel/typescript"
  ];

  const plugins = [
    "babel-plugin-styled-components",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-transform-runtime"
  ];

  api.cache(true);

  return {
    presets,
    plugins
  };
}
