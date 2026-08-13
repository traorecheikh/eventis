import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

/**
 * Configuration ESLint (flat config) pour EventHub.
 *
 * Appliquée en CI ou via `npm run lint` :
 * - règles recommandées JS (eslint:recommended)
 * - règles recommandées Vue 3 (vue:recommended)
 * - détection des imports inutilisés (no-unused-vars)
 */
export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      // Incompatibles avec Tailwind (listes de classes utilitaires longues,
      // une par attribut, sur une seule ligne est l'usage idiomatique).
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  },
  {
    files: ['**/*.spec.js', '**/*.test.js'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test-results/**']
  }
]
