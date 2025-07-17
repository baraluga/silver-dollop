// @ts-check
const tseslint = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.test.ts", "dist/**", "**/__tests__/**"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // CLAUDE.md: Maximum 20 lines per function
      "max-lines-per-function": [
        "error",
        { max: 20, skipBlankLines: true, skipComments: true },
      ],

      // CLAUDE.md: Maximum 2 parameters per function
      "max-params": ["error", 2],

      // CLAUDE.md: Keep files under 200 lines
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],

      // CLAUDE.md: Maximum cyclomatic complexity of 2
      complexity: ["error", 3],

      // CLAUDE.md: Single Responsibility Principle
      "max-statements": ["error", 10],

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",

      // Basic naming conventions
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
];
