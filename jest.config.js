module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {},
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  verbose: true,
};
