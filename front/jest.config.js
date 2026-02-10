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
    '@testing-library/jest-dom/extend-expect',
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
    '<rootDir>/node_modules/(?!(lodash-es|d3-format|@hookform/resolvers|dnd-core|react-dnd|dnd-core|@react-dnd|@arcgis|@esri|@stencil|formdata-node)).+\\.js$',
  ],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/app/utils/testUtils/fileMock.js',
    '^react-scroll-to-component$': 'identity-obj-proxy',
    '@citizenlab/cl2-component-library': '<rootDir>/app/component-library',
  },
  modulePathIgnorePatterns: ['.*__mocks__.*'],
  testEnvironment: '<rootDir>/internals/jest/jsdom-no-canvas.js',
  testEnvironmentOptions: {
    url: 'https://demo.stg.govocal.com/en/',
    customExportConditions: [''],
  },
  resolver: `${__dirname}/internals/jest/resolver.js`,
};
