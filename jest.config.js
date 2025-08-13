module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    globalSetup: "<rootDir>/tests/jestGlobalSetup.ts",
    globalTeardown: "<rootDir>/tests/jestGlobalTeardown.ts",
    setupFilesAfterEnv: ["<rootDir>/tests/jestSetup.ts"], // optional per-test setup
  };
  