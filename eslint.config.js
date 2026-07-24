import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Allow unused vars starting with underscore, and allow React (handled by JSX transform)
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^(_|React$)',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Downgrade set-state-in-effect to a warning — many existing patterns are intentional initializations
      'react-hooks/set-state-in-effect': 'warn',
      // Allow context/hook files to export both provider and hook from the same file
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])



