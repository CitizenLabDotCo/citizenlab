import { Multiloc } from 'typings';

export function getLocalized(multiloc: Multiloc | null, locale: string, currentTenantLocales: string[]) {
  let text: string = '';

  if (multiloc) {
    if (multiloc[locale]) {
      text = multiloc[locale];
    } else if (currentTenantLocales && currentTenantLocales.length > 0) {
      currentTenantLocales.forEach((currentTenantLocale) => {
        if (multiloc[currentTenantLocale]) {
          text = multiloc[currentTenantLocale];
          return false;
        }

        return true;
      });
    }

    if (text === '') {
      if (multiloc['en']) {
        text = multiloc['en'];
      } else if (multiloc['nl']) {
        text = multiloc['nl'];
      } else if (multiloc['fr']) {
        text = multiloc['fr'];
      }
    }
  }

  return text;
}
