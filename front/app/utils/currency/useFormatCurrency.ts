import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import formatCurrency from './formatCurrency';

const useFormatCurrency = (amount: number) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const currency = appConfig?.data.attributes.settings.core.currency;

  return () => formatCurrency(locale, currency, amount);
};

export default useFormatCurrency;
