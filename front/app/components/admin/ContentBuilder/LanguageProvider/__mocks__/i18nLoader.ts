let translations: Record<string, Record<string, string>> = {
  en: { message: 'Hello' },
  'fr-FR': { message: 'Bonjour' },
};

export const i18nImports = new Proxy(
  {},
  {
    get(_, localePath: string) {
      const match = localePath.match(/\/i18n\/(.+)\.ts/);
      if (!match) {
        return undefined;
      }

      const locale = match[1];
      if (locale in translations) {
        return () =>
          Promise.resolve({
            default: translations[locale],
          });
      }

      return undefined;
    },
  }
);

export const setTranslations = (newTranslations: typeof translations) => {
  translations = newTranslations;
};
