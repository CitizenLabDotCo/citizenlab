import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import { Multiloc } from 'typings';

interface ILocalizeOptions {
  maxChar?: number;
  /** fallback string if missing locale or empty string */
  fallback?: string;
}

export type Localize = (
  multiloc: Multiloc | null | undefined,
  options?: ILocalizeOptions
) => string;

export default function useLocalize(): Localize {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  const localize = (
    multiloc: Multiloc,
    { maxChar, fallback }: ILocalizeOptions = {}
  ) => {
    if (!isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      return getLocalized(multiloc, locale, tenantLocales, maxChar, fallback);
    }

    return '';
  };

  return localize;
}
