module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/*.spec.ts"], // Only test files inside `tests/` folder
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  transformIgnorePatterns: ["node_modules/(?!(@joue-bien/audio-transport)/)"],
};
