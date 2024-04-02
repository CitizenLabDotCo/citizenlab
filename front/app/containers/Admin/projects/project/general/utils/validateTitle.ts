import { Multiloc, SupportedLocale } from 'typings';

export default function validateTitle(
  appConfigLocales: SupportedLocale[],
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
