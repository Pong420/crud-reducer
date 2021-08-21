module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  testEnvironment: 'jsdom',
  testRegex: '.test.ts$',
  testPathIgnorePatterns: ['/node_modules/']
};
