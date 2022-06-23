import createConvertAndMergeSeries from './convertAndMergeSeries';

jest.mock('services/appConfiguration');
jest.mock('moment', () => () => ({ year: () => 2022 }));

const convertAndMergeSeries = createConvertAndMergeSeries({
  formatMessage: (message) => (message ? message.defaultMessage || '' : ''),
  localize: (multiloc) => (multiloc ? multiloc.en || '' : ''),
});

describe('createConvertAndMergeSeries', () => {
  it('works with birthyear', () => {
    const output = convertAndMergeSeries(
      { series: { users: { 1999: 6, 2004: 6 } } },
      { series: { users: { 1999: 2, 2004: 3 } } },
      'birthyear'
    );

    const expectedOutput = [
      { name: '10 - 19', total: 6, participants: 3 },
      { name: '20 - 29', total: 6, participants: 2 },
    ];

    expect(output[1]).toEqual(expectedOutput[0]);
    expect(output[2]).toEqual(expectedOutput[1]);
  });

  it('works with gender', () => {
    const output = convertAndMergeSeries(
      {
        series: { users: { male: 10, female: 12, unspecified: 3, _blank: 2 } },
      },
      { series: { users: { male: 3, female: 5, unspecified: 2, _blank: 0 } } },
      'gender'
    );

    const expectedOutput = [
      { name: 'male', total: 10, participants: 3 },
      { name: 'female', total: 12, participants: 5 },
      { name: 'unspecified', total: 3, participants: 2 },
      { name: 'unknown', total: 2, participants: 0 },
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with domicile (sorted descendingly by participants)', () => {
    const areas = {
      a: { title_multiloc: { en: 'a' } },
      b: { title_multiloc: { en: 'b' } },
    };

    const totalSerie = {
      areas,
      series: {
        users: {
          a: 5,
          b: 5,
          _blank: 1,
          outside: 2,
        },
      },
    };

    const participantSerie = {
      series: {
        users: {
          a: 2,
          b: 3,
          _blank: 0,
          outside: 1,
        },
      },
    };

    const output = convertAndMergeSeries(
      totalSerie,
      participantSerie,
      'domicile'
    );

    const expectedOutput = [
      { name: 'b', total: 5, participants: 3 },
      { name: 'a', total: 5, participants: 2 },
      { name: 'Other', total: 2, participants: 1 },
      { name: 'unknown', total: 1, participants: 0 },
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works for other fields (sorted descendingly by participants)', () => {
    const options = {
      a: { title_multiloc: { en: 'a' } },
      b: { title_multiloc: { en: 'b' } },
    };

    const totalSerie = {
      options,
      series: {
        users: {
          a: 5,
          b: 5,
        },
      },
    };

    const participantSerie = {
      series: {
        users: {
          a: 2,
          b: 3,
        },
      },
    };

    const output = convertAndMergeSeries(
      totalSerie,
      participantSerie,
      'education'
    );

    const expectedOutput = [
      { name: 'b', total: 5, participants: 3 },
      { name: 'a', total: 5, participants: 2 },
    ];

    expect(output).toEqual(expectedOutput);
  });
});
