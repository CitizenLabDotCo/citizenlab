// Libraries
import React from 'react';

// Services

// hooks
import { Localize } from 'hooks/useLocalize';

// i18n
import { getLocalizedWithFallback } from 'utils/i18n';

// Typing
import { Locale } from 'typings';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { isNilOrError } from './helperUtils';

export interface InjectedLocalized {
  localize: Localize;
  locale: Locale;
  tenantLocales: Locale[];
}

export interface State {
  locale: Locale | undefined;
  tenantLocales: Locale[];
}

export default function injectLocalize<P>(
  Component: React.ComponentType<P & InjectedLocalized>
) {
  const Localized = (props: P) => {
    const locale = useLocale();
    const { data: appConfiguration } = useAppConfiguration();
    const tenantLocales =
      appConfiguration?.data.attributes.settings.core.locales;

    const localize: Localize = (multiloc, { maxChar, fallback } = {}) => {
      return getLocalizedWithFallback(
        multiloc,
        locale,
        tenantLocales,
        maxChar,
        fallback
      );
    };

    if (!isNilOrError(locale) && tenantLocales) {
      return (
        <Component
          localize={localize}
          locale={locale}
          tenantLocales={tenantLocales}
          {...props}
        />
      );
    }

    return null;
  };
  return Localized;
}
