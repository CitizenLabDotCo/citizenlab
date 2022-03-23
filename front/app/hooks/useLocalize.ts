import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { getLocalizedWithFallback } from 'utils/i18n';
import { Multiloc } from 'typings';

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

  const localize = (
    multiloc?: Multiloc,
    { maxChar, fallback }: ILocalizeOptions = {}
  ) => {
    return getLocalizedWithFallback(
      multiloc,
      locale,
      tenantLocales,
      maxChar,
      fallback
    );
  };

  return localize;
}
