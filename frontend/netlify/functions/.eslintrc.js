module.exports = {
  // Voor Netlify Functions gebruiken we CommonJS en Node.js specifieke regels
  env: {
    node: true,
    browser: false,
  },
  parserOptions: {
    sourceType: 'commonjs',
    ecmaVersion: 2020,
  },
  rules: {
    // Netlify Functions gebruiken vaak require() syntax
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-commonjs': 'off',
    // Sta toe dat parameters gedefinieerd zijn maar niet gebruikt worden
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_|^context$|^event$',
      'varsIgnorePattern': '^_' 
    }],
    // Sta import statements toe zonder extensies
    'import/extensions': 'off',
  },
};