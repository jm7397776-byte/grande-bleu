const jestPlugin = require("eslint-plugin-jest");

module.exports = [
  {
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: "error",
      "no-console": "warn",
    },
  },
  {
    files: ["src/__tests__/**/*.js"],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
];
