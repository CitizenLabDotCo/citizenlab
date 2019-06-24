module.exports = function (api) {
  api.cache(api.env('development'));

  const presets = [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: 3,
        targets: {
          browsers: [
            "last 2 Chrome versions",
            "last 2 Firefox versions",
            "last 2 Edge versions",
            "last 2 Opera versions",
            "last 2 Safari versions",
            "ie 11"
          ]
        }
      }
    ],
    "@babel/preset-react",
    "@babel/typescript"
  ];

  const plugins = [
    ["babel-plugin-styled-components", {
      "pure": true
    }],
    "@babel/plugin-syntax-dynamic-import",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    ["@babel/plugin-transform-runtime", { corejs: 3 }]
  ];

  const env = {
    test: {
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/typescript"
      ],
      plugins: [
        ["babel-plugin-styled-components", {
          "pure": true
        }],
        "transform-es2015-modules-commonjs",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        ["@babel/plugin-transform-runtime", { corejs: 3 }]
      ],
    }
  }

  return {
    presets,
    plugins,
    env
  };
}
