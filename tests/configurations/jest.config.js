module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!**/node_modules/**', '!**/vendor/**'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'html', 'json'],
  rootDir: '../../.',
  setupFiles: ['<rootDir>/tests/configurations/jest.setup.js'],
  globalTeardown: '<rootDir>/tests/configurations/jest.teardown.js',
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: ['default', ['jest-html-reporters', { pageTitle: 'tess', publicPath: './reports', filename: 'test.html' }]],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};
