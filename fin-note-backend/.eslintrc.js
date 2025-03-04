module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'jest', 'security'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:security/recommended-legacy',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off', // Правило, требующее, чтобы имена интерфейсов начинались с "I" (например, IUser). (выкл)
    '@typescript-eslint/explicit-function-return-type': 'off', // Требование явного указания типа возвращаемого значения для функций. (выкл)
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Требование явно указывать типы для экспортируемых функций и классов. (выкл)
    '@typescript-eslint/no-explicit-any': 'off', // Правило, которое запрещает использование типа any в TypeScript. (выкл)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ], // Правило, которое предупреждает о неиспользуемых переменных в коде. (выкл)

    // JEST
    // Основные правила для качества тестов
    'jest/no-disabled-tests': 'warn', // Предупреждать о закомментированных тестах
    'jest/no-focused-tests': 'error', // Ошибка при использовании .only
    'jest/valid-expect': 'error', // Проверять корректность expect
    'jest/valid-expect-in-promise': 'error', // Требует обработки промисов в expect

    // Правила для читаемости и стиля
    'jest/prefer-to-have-length': 'warn', // Предпочитать .toHaveLength() вместо .length в expect
    'jest/no-identical-title': 'error', // Запрещает одинаковые заголовки тестов
    'jest/consistent-test-it': ['warn', { fn: 'it' }], // Требует уникальные заголовки тестов в одном describe
    'jest/require-top-level-describe': 'off', // Требует описания теста (заголовок не должен быть пустым)

    // Правила для предотвращения ошибок
    'jest/no-standalone-expect': 'error', // Запрещает expect вне it/test
    'jest/expect-expect': 'warn', // Проверяет, что expect вызывается хотя бы раз в тесте

    // Правила для работы с асинхронностью
    'jest/no-jasmine-globals': 'error', // Запрещает использование setTimeout в тестах

    // SECURITY
    'security/detect-eval-with-expression': 'error', // Ошибка при использовании eval
    'security/detect-object-injection': 'warn', // Проверяет доступ к свойствам объекта через динамические ключи (например, obj[userInput])
  },
};
