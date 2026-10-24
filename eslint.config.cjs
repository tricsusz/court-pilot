const { defineConfig } = require('eslint/config');
const angular = require('angular-eslint');

module.exports = defineConfig(
  { ignores: ['projects/**', 'www/**', 'coverage/**'] },
  {
    files: ['src/**/*.ts'],
    extends: angular.configs.tsRecommended,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Preserve existing Ionic page updates while retaining Zone.js.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
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
