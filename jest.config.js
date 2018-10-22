module.exports = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  preset: undefined,
  setupTestFrameworkScriptFile: "<rootDir>/internals/jest/setup.js",
  testMatch: [
    "**/?(*.)+(spec|test).(js|jsx|ts|tsx)"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleDirectories: [
    "node_modules",
    "app"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!lodash-es)"
  ]
};
