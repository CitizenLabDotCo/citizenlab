module.exports = function (api) {
  api.cache(api.env('development'));

  const presets = [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        modules: false,
        debug: false,
        corejs: 3,
        targets: {
          browsers: [
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Edge versions',
            'last 2 Opera versions',
            'last 2 Safari versions',
          ],
        },
      },
    ],
    '@babel/preset-react',
    '@babel/typescript',
  ];

  const plugins = [
    [
      'babel-plugin-styled-components',
      {
        pure: true,
      },
    ],
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime',
  ];

  // No `test` env: Jest transforms with @swc/jest (see jest.config.js), not
  // babel. This config is still used by Storybook's babel-loader and by the
  // extract-intl script.
  return {
    presets,
    plugins,
  };
};
