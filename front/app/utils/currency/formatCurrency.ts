import { SupportedLocale } from 'typings';

import { TCountryCurrency } from 'api/app_configuration/types';

function formatCurrency(
  locale: SupportedLocale,
  currency: TCountryCurrency | undefined,
  amount: number,
  { maximumFractionDigits = 0 }: { maximumFractionDigits?: number } = {}
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: currency ? 'currency' : 'decimal',
    currency,
    maximumFractionDigits,
    currencyDisplay: 'code',
  });

  return formatter.format(amount);
}

export default formatCurrency;
