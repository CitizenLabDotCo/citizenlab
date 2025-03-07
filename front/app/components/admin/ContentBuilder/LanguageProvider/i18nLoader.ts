export const i18nImports = import.meta.glob('/i18n/*.ts') as Record<
  string,
  (() => Promise<{ default: object }>) | undefined
>;
