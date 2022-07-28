import {
  toReferenceDataRegField,
  getIncludedUsers,
  RepresentativenessRowMultiloc,
} from './useReferenceData';

jest.mock('services/appConfiguration');
jest.mock('services/auth');

describe('toReferenceDataRegField', () => {
  it('works if users and reference_population have same keys', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 100,
          id456: 300,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
      options: {
        id123: {
          title_multiloc: { en: '123' },
          ordering: 0,
        },
        id456: {
          title_multiloc: { en: '456' },
          ordering: 1,
        },
      },
    };

    const expectedOutput: RepresentativenessRowMultiloc[] = [
      {
        title_multiloc: { en: '123' },
        referenceNumber: 2000,
        referencePercentage: 40,
        actualNumber: 100,
        actualPercentage: 25,
      },
      {
        title_multiloc: { en: '456' },
        referenceNumber: 3000,
        referencePercentage: 60,
        actualNumber: 300,
        actualPercentage: 75,
      },
    ];

    const { options, series: { users, reference_population } } = usersByField;
    expect(toReferenceDataRegField(users, reference_population, options)).toEqual(expectedOutput);
  });

  it('works if users and reference_population have same keys, weird ordering', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 100,
          id456: 300,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
      options: {
        id123: {
          title_multiloc: { en: '123' },
          ordering: 1,
        },
        id456: {
          title_multiloc: { en: '456' },
          ordering: 0,
        },
      },
    };

    const expectedOutput: RepresentativenessRowMultiloc[] = [
      {
        title_multiloc: { en: '456' },
        referenceNumber: 3000,
        referencePercentage: 60,
        actualNumber: 300,
        actualPercentage: 75,
      },
      {
        title_multiloc: { en: '123' },
        referenceNumber: 2000,
        referencePercentage: 40,
        actualNumber: 100,
        actualPercentage: 25,
      },
    ];

    const { options, series: { users, reference_population } } = usersByField;
    expect(toReferenceDataRegField(users, reference_population, options)).toEqual(expectedOutput);
  });

  it('works if reference data has fewer keys van user data', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 100,
          id456: 300,
          id789: 200,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
      options: {
        id123: {
          title_multiloc: { en: '123' },
          ordering: 0,
        },
        id456: {
          title_multiloc: { en: '456' },
          ordering: 1,
        },
        id789: {
          title_multiloc: { en: '789' },
          ordering: 2,
        },
      },
    };

    const expectedOutput: RepresentativenessRowMultiloc[] = [
      {
        title_multiloc: { en: '123' },
        referenceNumber: 2000,
        referencePercentage: 40,
        actualNumber: 100,
        actualPercentage: 25,
      },
      {
        title_multiloc: { en: '456' },
        referenceNumber: 3000,
        referencePercentage: 60,
        actualNumber: 300,
        actualPercentage: 75,
      },
    ];

    const { options, series: { users, reference_population } } = usersByField;
    expect(toReferenceDataRegField(users, reference_population, options)).toEqual(expectedOutput);
  });

  it('actual numbers fall back to zero if all relevant user data entries are zero (i.e. missing)', () => {
    const usersByField: any = {
      series: {
        users: {
          id789: 200,
          id000: 300,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
      options: {
        id123: {
          title_multiloc: { en: '123' },
          ordering: 0,
        },
        id456: {
          title_multiloc: { en: '456' },
          ordering: 1,
        },
        id789: {
          title_multiloc: { en: '789' },
          ordering: 2,
        },
        id000: {
          title_multiloc: { en: '000' },
          ordering: 3,
        },
      },
    };

    const expectedOutput: RepresentativenessRowMultiloc[] = [
      {
        title_multiloc: { en: '123' },
        referenceNumber: 2000,
        referencePercentage: 40,
        actualNumber: 0,
        actualPercentage: 0,
      },
      {
        title_multiloc: { en: '456' },
        referenceNumber: 3000,
        referencePercentage: 60,
        actualNumber: 0,
        actualPercentage: 0,
      },
    ];

    const { options, series: { users, reference_population } } = usersByField;
    expect(toReferenceDataRegField(users, reference_population, options)).toEqual(expectedOutput);
  });
});

describe('getIncludedUsers', () => {
  it('works', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 100,
          id456: 300,
          _blank: 400,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
    };

    const expectedOutput = {
      known: 400,
      total: 800,
      percentage: 50,
    };

    const { series: { users, reference_population } } = usersByField;
    expect(getIncludedUsers(users, reference_population)).toEqual(expectedOutput);
  });

  it('works if not all keys in users are in reference_population', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 100,
          id456: 300,
          id789: 200,
          _blank: 400,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
    };

    const expectedOutput = {
      known: 400,
      total: 800,
      percentage: 50,
    };

    const { series: { users, reference_population } } = usersByField;
    expect(getIncludedUsers(users, reference_population)).toEqual(expectedOutput);
  });

  it('returns 0 if all relevant keys are 0', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 0,
          id456: 0,
          id789: 200,
          _blank: 400,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
    };

    const expectedOutput = {
      known: 0,
      total: 400,
      percentage: 0,
    };

    const { series: { users, reference_population } } = usersByField;
    expect(getIncludedUsers(users, reference_population)).toEqual(expectedOutput);
  });

  it('returns 0 if all relevant keys (including _blank) are 0', () => {
    const usersByField: any = {
      series: {
        users: {
          id123: 0,
          id456: 0,
          id789: 200,
          _blank: 0,
        },
        reference_population: {
          id123: 2000,
          id456: 3000,
        },
      },
    };

    const expectedOutput = {
      known: 0,
      total: 0,
      percentage: 0,
    };

    const { series: { users, reference_population } } = usersByField;
    expect(getIncludedUsers(users, reference_population)).toEqual(expectedOutput);
  });
});
