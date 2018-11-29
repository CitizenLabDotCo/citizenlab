// i18n
import { getLocalized } from 'utils/i18n';

// Typing
import { Multiloc, Locale } from 'typings';

import { InjectedLocalized } from 'utils/localize';

export const localizeProps = {
  localize: (multiloc: Multiloc) => {
    return getLocalized(multiloc, 'en', ['en', 'fr-BE']);
  },
  locale: 'en',
  tenantLocales: ['en', 'fr-BE']
} as InjectedLocalized;
