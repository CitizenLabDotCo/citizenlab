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
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/internals/jest/setup.js'],
  testMatch: ['**/?(*.)+(spec|test).(js|jsx|ts|tsx)'],
  moduleDirectories: ['node_modules', 'app'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es).+\\.js$'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  moduleNameMapper: {
    '\\.(css|svg|png|jpg)$': 'identity-obj-proxy',
    '^react-scroll-to-component$': 'identity-obj-proxy',
  },
  testURL: 'https://demo.stg.citizenlab.co/en/',
  globals: {
    __DEV__: true,
    CL_CONFIG: clConfig,
    streams: [],
  },
};
