const { defineConfig } = require('eslint/config');
const angular = require('angular-eslint');
const typescript = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig(
  { ignores: ['projects/**', 'www/**', 'coverage/**'] },
  {
    files: ['src/**/*.ts', 'db.ts'],
    extends: angular.configs.tsRecommended,
    plugins: { '@typescript-eslint': typescript },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname
      }
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Ionic outlets and plain-field forms need eager change detection.
      // https://ionicframework.com/docs/angular/lifecycle
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@angular-eslint/component-class-suffix': [
        'error',
        { suffixes: ['Page', 'Component'] }
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ]
    }
  },
  {
    files: ['src/**/*.html'],
    extends: angular.configs.templateRecommended
  }
);
