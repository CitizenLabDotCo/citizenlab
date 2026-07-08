export const i18nImports = import.meta.glob([
  '/i18n/*.ts',
  '!/i18n/*.test.ts',
]) as Record<
  string,
  (() => Promise<{ default: object }>) | undefined
>;
