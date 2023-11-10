module.exports = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/internals/jest/setup.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testMatch: ['**/?(*.)+(spec|test).(js|jsx|ts|tsx)'],
  moduleDirectories: ['node_modules', 'src'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es).+\\.js$'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/utils/testUtils/fileMock.js',
    '^react-scroll-to-component$': 'identity-obj-proxy',
    '^lodash-es$': 'lodash',
  },
};
