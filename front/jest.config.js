const path = require('path');
const clConfig = require(path.join(process.cwd(), '../citizenlab.config.json'));
try {
  const clConfigEe = require(path.join(
    process.cwd(),
    '../citizenlab.config.ee.json'
  ));
  clConfig['modules'] = { ...clConfig['modules'], ...clConfigEe['modules'] };
} catch (e) {}

module.exports = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  preset: undefined,
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/internals/jest/setup.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testMatch: ['**/?(*.)+(spec|test).(js|jsx|ts|tsx)'],
  moduleDirectories: ['node_modules', 'app'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(lodash-es|d3-format|@hookform/resolvers)).+\\.js$',
  ],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/app/utils/testUtils/fileMock.js',
    '^react-scroll-to-component$': 'identity-obj-proxy',
  },
  testEnvironmentOptions: {
    url: 'https://demo.stg.citizenlab.co/en/',
  },
  globals: {
    CL_CONFIG: clConfig,
  },
  resolver: `${__dirname}/internals/jest/resolver.js`,
};
