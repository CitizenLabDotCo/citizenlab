import { Multiloc, Locale } from 'typings';

export default function validateTitle(
  appConfigLocales: Locale[],
  titleMultiloc: Multiloc | undefined,
  errorMessage: string
) {
  const titleError = {};

  if (titleMultiloc === undefined) {
    appConfigLocales.forEach((currentTenantLocale) => {
      titleError[currentTenantLocale] = errorMessage;
    });
  } else {
    appConfigLocales.forEach((currentTenantLocale) => {
      const title = titleMultiloc[currentTenantLocale];

      if (!title) {
        titleError[currentTenantLocale] = errorMessage;
      }
    });
  }

  return titleError;
}
