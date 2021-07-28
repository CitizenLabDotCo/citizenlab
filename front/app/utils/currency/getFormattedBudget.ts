import { Locale } from 'typings';

export default function getFormattedBudget(
  locale: Locale,
  budget: number,
  currency: string
) {
  return new Intl.NumberFormat(locale, {
    currency,
    localeMatcher: 'best fit',
    style: 'currency',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(budget);
}
