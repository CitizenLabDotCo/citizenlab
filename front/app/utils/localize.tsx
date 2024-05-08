import React from 'react';

import { SupportedLocale } from 'typings';

// Typing
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';
import { Localize } from 'hooks/useLocalize';

import { getLocalizedWithFallback } from 'utils/i18n';

import { isNilOrError } from './helperUtils';

export interface InjectedLocalized {
  localize: Localize;
  locale: SupportedLocale;
  tenantLocales: SupportedLocale[];
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
