import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import { Multiloc } from 'typings';

export default function useLocalize() {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  const localize = (multiloc: Multiloc, maxChar?: number) => {
    if (!isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      return getLocalized(multiloc, locale, tenantLocales, maxChar);
    }

    return '';
  };

  return localize;
}
