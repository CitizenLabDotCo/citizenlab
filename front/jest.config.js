module.exports = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  preset: undefined,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/internals/jest/setup.js',
    '@testing-library/jest-dom',
  ],
  testMatch: ['**/?(*.)+(test).(js|jsx|ts|tsx)'],
  testPathIgnorePatterns: ['<rootDir>/internals/'],
  moduleDirectories: ['node_modules', 'app'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!.storybook/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(lodash-es|d3-format|@hookform/resolvers|dnd-core|react-dnd|dnd-core|@react-dnd|@arcgis|@esri|@stencil|formdata-node|quill|@enzedonline|parchment|lit|@lit|lit-html|lit-element|uuid|@intl-tel-input|intl-tel-input)).+\\.js$',
  ],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    // intl-tel-input ships ESM-only with an `exports` map that exposes just an
    // `import` condition, which Jest's CommonJS resolver can't follow — so we point
    // it straight at the built entry files (which transformIgnorePatterns above then
    // transpiles). CSS can't be parsed, hence the stub.
    '^@intl-tel-input/react$':
      '<rootDir>/node_modules/@intl-tel-input/react/dist/IntlTelInput.js',
    '^intl-tel-input/utils$':
      '<rootDir>/node_modules/intl-tel-input/dist/js/utils.js',
    '^intl-tel-input/styles$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/app/utils/testUtils/fileMock.js',
    '^react-scroll-to-component$': 'identity-obj-proxy',
    '@citizenlab/cl2-component-library': '<rootDir>/app/component-library',
    '^@arcgis/core/widgets/Popup$': '<rootDir>/app/utils/testUtils/fileMock.js',
  },
  modulePathIgnorePatterns: ['.*__mocks__.*'],
  testEnvironment: '<rootDir>/internals/jest/jsdom-no-canvas.js',
  testEnvironmentOptions: {
    url: 'https://demo.stg.govocal.com/en/',
    customExportConditions: [''],
  },
  resolver: `${__dirname}/internals/jest/resolver.js`,
};
