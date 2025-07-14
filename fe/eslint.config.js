// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("@angular-eslint/eslint-plugin");

module.exports = [
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      // CLAUDE.md: Maximum 20 lines per function
      "max-lines-per-function": ["error", { max: 20, skipBlankLines: true, skipComments: true }],
      
      // CLAUDE.md: Maximum 2 parameters per function
      "max-params": ["error", 2],
      
      // CLAUDE.md: Keep files under 200 lines
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      
      // CLAUDE.md: Maximum cyclomatic complexity of 2
      "complexity": ["error", 2],
      
      // CLAUDE.md: Single Responsibility Principle
      "max-statements": ["error", 10],
      
      // CLAUDE.md: Always use types
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      
      // CLAUDE.md: Meaningful names, no abbreviations
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      
      // Code quality rules aligned with CLAUDE.md
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-const": "error",
      
      // Disable overly strict rules for Angular
      "@typescript-eslint/explicit-member-accessibility": "off",
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: require("@angular-eslint/template-parser"),
    },
    plugins: {
      "@angular-eslint/template": require("@angular-eslint/eslint-plugin-template"),
    },
    rules: {
      "@angular-eslint/template/no-negated-async": "error",
    },
  }
];