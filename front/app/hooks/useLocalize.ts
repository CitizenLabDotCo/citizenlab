import { useCallback } from 'react';

import { Multiloc } from 'typings';

import { getLocalizedWithFallback } from 'utils/i18n';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

interface ILocalizeOptions {
  maxChar?: number;
  /** fallback string if undefined multiloc, missing locale or empty string */
  fallback?: string;
}

export type Localize = (
  multiloc: Multiloc | null | undefined,
  options?: ILocalizeOptions
) => string;

export default function useLocalize(): Localize {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  const localize = useCallback(
    (multiloc?: Multiloc, { maxChar, fallback }: ILocalizeOptions = {}) => {
      return getLocalizedWithFallback(
        multiloc,
        locale,
        tenantLocales,
        maxChar,
        fallback
      );
    },
    [locale, tenantLocales]
  );

  return localize;
}
