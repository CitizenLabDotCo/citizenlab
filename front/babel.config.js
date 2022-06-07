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

  const env = {
    test: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/typescript',
      ],
      plugins: [
        [
          'babel-plugin-styled-components',
          {
            pure: true,
          },
        ],
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-runtime',
        'dynamic-import-node',
      ],
    },
  };

  return {
    presets,
    plugins,
    env,
  };
};
