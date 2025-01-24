import { SupportedLocale } from 'typings';

import { TCountryCurrency } from 'api/app_configuration/types';

function formatCurrency(
  locale: SupportedLocale,
  currency: TCountryCurrency | undefined,
  amount: number,
  { maximumFractionDigits = 0 }: { maximumFractionDigits?: number } = {}
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount);
}

export default formatCurrency;
