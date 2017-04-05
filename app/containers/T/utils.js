export function findTranslatedText(value, userLocale, tenantLocales) {
  let text = '';
  if (value[userLocale]) {
    text = value[userLocale];
  } else {
    tenantLocales.some((tenantLocale) => {
      if (value[tenantLocale]) {
        text = value[tenantLocale];
        return true;
      }
      return false;
    });
  }

  return text;
}
