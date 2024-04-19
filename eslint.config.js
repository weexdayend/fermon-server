export default [
  {
      files: ["*.js"],
      ignores: ["**/*.config.js", "!**/eslint.config.js"],
      rules: {
          semi: "error"
      }
  }
];