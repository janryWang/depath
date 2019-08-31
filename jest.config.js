module.exports = {
  collectCoverage: true,
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: true,
      tsConfig: './tsconfig.json'
    }
  },
  //watchPlugins: ['jest-watch-lerna-packages'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'package.json',
    '/demo/',
    '/packages/builder/src/__tests__/',
    '/packages/builder/src/components/',
    '/packages/builder/src/configs/',
    'package-lock.json'
  ]
}
