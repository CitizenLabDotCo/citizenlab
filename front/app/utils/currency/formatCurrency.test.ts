import formatCurrency from './formatCurrency';

describe('formatCurrency', () => {
  const nonBreakingSpace = '\xa0';

  it('respects separator conventions', () => {
    // In US English, commas are used as thousands separators and periods as decimal separators.
    expect(
      formatCurrency('en', 'USD', 10000, { maximumFractionDigits: 2 })
    ).toEqual('$10,000.00');
    // In Dutch, periods are used as thousands separators and commas as decimal separators.
    expect(
      formatCurrency('nl-BE', 'EUR', 10000, { maximumFractionDigits: 2 })
    ).toEqual(`€${nonBreakingSpace}10.000,00`);
  });

  it('respects the currency symbol position', () => {
    // USD is a currency that uses the $ symbol before the amount, without a space.
    expect(formatCurrency('en', 'USD', 100)).toEqual('$100');

    // With EUR, depending on convention in each nation, the symbol can either precede or follow the value,
    // e.g., €10 or 10 €, often with an intervening space.
    expect(formatCurrency('nl-BE', 'EUR', 100)).toEqual(
      `€${nonBreakingSpace}100`
    );
    expect(formatCurrency('de-DE', 'EUR', 100)).toEqual(
      `100${nonBreakingSpace}€`
    );
  });

  it('has a reasonable fallback if the currency is undefined', () => {
    expect(formatCurrency('en', undefined, 100)).toEqual('100');
  });
});
