import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import formatCurrency from './formatCurrency';
import messages from './messages';

export type UseFormatCurrencyReturn = ReturnType<typeof useFormatCurrency>;

const useFormatCurrency = () => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const currency = appConfig?.data.attributes.settings.core.currency;
  const { formatMessage, formatNumber } = useIntl();

  if (currency === 'TOK') {
    return (amount: number) =>
      formatMessage(messages.xTokens, { numberOfTokens: formatNumber(amount) });
  }

  if (currency === 'CRE') {
    return (amount: number) =>
      formatMessage(messages.xCredits, {
        numberOfCredits: formatNumber(amount),
      });
  }

  return (amount: number) => formatCurrency(locale, currency, amount);
};

export default useFormatCurrency;
