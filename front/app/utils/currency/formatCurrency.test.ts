import formatCurrency from './formatCurrency';

describe('formatCurrency', () => {
  const nonBreakingSpace = '\xa0';

  it('respects separator conventions', () => {
    // In US English, commas are used as thousands separators and periods as decimal separators.
    expect(
      formatCurrency('en', 'USD', 10000, { maximumFractionDigits: 2 })
    ).toEqual(`USD${nonBreakingSpace}10,000.00`);
    // In Dutch, periods are used as thousands separators and commas as decimal separators.
    expect(
      formatCurrency('nl-BE', 'EUR', 10000, { maximumFractionDigits: 2 })
    ).toEqual(`EUR${nonBreakingSpace}10.000,00`);
  });

  it('respects the currency code position', () => {
    // USD is placed in front.
    expect(formatCurrency('en', 'USD', 100)).toEqual(
      `USD${nonBreakingSpace}100`
    );
    // With EUR, depending on convention in each nation, the code can either precede or follow the amount.
    expect(formatCurrency('nl-BE', 'EUR', 100)).toEqual(
      `EUR${nonBreakingSpace}100`
    );
    expect(formatCurrency('de-DE', 'EUR', 100)).toEqual(
      `100${nonBreakingSpace}EUR`
    );
  });

  it('has a reasonable fallback if the currency is undefined', () => {
    expect(formatCurrency('en', undefined, 100)).toEqual('100');
  });
});
