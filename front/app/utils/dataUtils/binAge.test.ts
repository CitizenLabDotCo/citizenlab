import binAge, { defaultBinFunction } from './binAge';

jest.mock('moment', () => () => ({ year: () => 2022 }));

describe('defaultBinFunction', () => {
  it('works if age < 10', () => {
    expect(defaultBinFunction('2014')).toBe('0 - 9');
  });

  it('works if age is 36', () => {
    expect(defaultBinFunction('1986')).toBe('30 - 39');
  });

  it('works if age > 90', () => {
    expect(defaultBinFunction('1930')).toBe('90+');
  });
});

describe('binBirthyear', () => {
  const data = {
    1930: 2,
    1986: 5,
    1987: 8,
    2003: 3,
    2004: 4,
    2019: 2,
    missing: 3,
  };

  it('works with default bins', () => {
    const expectedOutput = [
      { name: '0 - 9', value: 2 },
      { name: '10 - 19', value: 7 },
      { name: '20 - 29', value: 0 },
      { name: '30 - 39', value: 13 },
      { name: '40 - 49', value: 0 },
      { name: '50 - 59', value: 0 },
      { name: '60 - 69', value: 0 },
      { name: '70 - 79', value: 0 },
      { name: '80 - 89', value: 0 },
      { name: '90+', value: 2 },
      { name: '_blank', value: 3 },
    ];

    expect(binAge(data)).toEqual(expectedOutput);
  });

  it('works with custom bins', () => {
    const bins = ['0 - 29', '29+'];
    const binFunction = (year: string) => {
      const yearNumber = parseInt(year, 10);
      if (isNaN(yearNumber)) return null;
      return yearNumber > 1993 ? '0 - 29' : '29+';
    };

    const expectedOutput = [
      { name: '0 - 29', value: 9 },
      { name: '29+', value: 15 },
      { name: '_blank', value: 3 },
    ];

    expect(binAge(data, { binFunction, bins })).toEqual(expectedOutput);
  });

  it('works with custom missing bin name', () => {
    const expectedOutput = [
      { name: '0 - 9', value: 2 },
      { name: '10 - 19', value: 7 },
      { name: '20 - 29', value: 0 },
      { name: '30 - 39', value: 13 },
      { name: '40 - 49', value: 0 },
      { name: '50 - 59', value: 0 },
      { name: '60 - 69', value: 0 },
      { name: '70 - 79', value: 0 },
      { name: '80 - 89', value: 0 },
      { name: '90+', value: 2 },
      { name: 'TEST', value: 3 },
    ];

    expect(binAge(data, { missingBin: 'TEST' })).toEqual(expectedOutput);
  });
});
