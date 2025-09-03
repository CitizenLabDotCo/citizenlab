import { IUsersByAge } from 'api/users_by_age/types';
import { IUsersByCustomField } from 'api/users_by_custom_field/types';

import {
  regFieldToReferenceData,
  regFieldToIncludedUsers,
  ageFieldToReferenceData,
  ageFieldToIncludedUsers,
  RepresentativenessRowMultiloc,
} from './parseReferenceData';

describe('regFieldToReferenceData', () => {
  it('works if users and reference_population have same keys', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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

    expect(regFieldToReferenceData(usersByField)).toEqual(expectedOutput);
  });

  it('works if users and reference_population have same keys, weird ordering', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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

    expect(regFieldToReferenceData(usersByField)).toEqual(expectedOutput);
  });

  it('works if reference data has fewer keys van user data', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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

    expect(regFieldToReferenceData(usersByField)).toEqual(expectedOutput);
  });

  it('actual numbers fall back to zero if all relevant user data entries are zero (i.e. missing)', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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

    expect(regFieldToReferenceData(usersByField)).toEqual(expectedOutput);
  });
});

describe('regFieldToIncludedUsers', () => {
  it('works', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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
          options: {},
        },
      },
    };

    const expectedOutput = {
      known: 400,
      total: 800,
      percentage: 50,
    };

    expect(regFieldToIncludedUsers(usersByField)).toEqual(expectedOutput);
  });

  it('works if not all keys in users are in reference_population', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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
          options: {},
        },
      },
    };

    const expectedOutput = {
      known: 400,
      total: 800,
      percentage: 50,
    };

    expect(regFieldToIncludedUsers(usersByField)).toEqual(expectedOutput);
  });

  it('returns 0 if all relevant keys are 0', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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
          options: {},
        },
      },
    };

    const expectedOutput = {
      known: 0,
      total: 400,
      percentage: 0,
    };

    expect(regFieldToIncludedUsers(usersByField)).toEqual(expectedOutput);
  });

  it('returns 0 if all relevant keys (including _blank) are 0', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
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
          options: {},
        },
      },
    };

    const expectedOutput = {
      known: 0,
      total: 0,
      percentage: 0,
    };

    expect(regFieldToIncludedUsers(usersByField)).toEqual(expectedOutput);
  });

  it('works if less keys in users than in reference data', () => {
    const usersByField: IUsersByCustomField = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
          series: {
            users: {
              south_sunday: 1,
              _blank: 23,
            },
            reference_population: {
              south_sunday: 100,
              mosciskimouth: 100,
              east_teganmouth: 100,
              west_hopeport: 100,
              homenickville: 100,
              derrickville: 100,
              strackestad: 100,
              ake_tammarastad: 100,
              west_sheridan: 100,
              west_orval: 100,
            },
          },
          options: {},
        },
      },
    };

    const expectedOutput = {
      known: 1,
      total: 24,
      percentage: Math.round(100 / 24),
    };

    expect(regFieldToIncludedUsers(usersByField)).toEqual(expectedOutput);
  });
});

const ageField: IUsersByAge = {
  data: {
    type: 'users_by_age',
    attributes: {
      total_user_count: 100,
      unknown_age_count: 10,
      series: {
        user_counts: [100, 100, 100, 100, 100],
        reference_population: [1000, 500, 1500, 1000, 1000],
        bins: [18, 25, 35, 45, 65, null],
      },
    },
  },
};

describe('ageFieldToReferenceData', () => {
  it('works', () => {
    const locale = 'en';

    const expectedOutput = [
      {
        title_multiloc: { en: '18 - 24' },
        referenceNumber: 1000,
        referencePercentage: 20,
        actualNumber: 100,
        actualPercentage: 20,
      },
      {
        title_multiloc: { en: '25 - 34' },
        referenceNumber: 500,
        referencePercentage: 10,
        actualNumber: 100,
        actualPercentage: 20,
      },
      {
        title_multiloc: { en: '35 - 44' },
        referenceNumber: 1500,
        referencePercentage: 30,
        actualNumber: 100,
        actualPercentage: 20,
      },
      {
        title_multiloc: { en: '45 - 64' },
        referenceNumber: 1000,
        referencePercentage: 20,
        actualNumber: 100,
        actualPercentage: 20,
      },
      {
        title_multiloc: { en: '65+' },
        referenceNumber: 1000,
        referencePercentage: 20,
        actualNumber: 100,
        actualPercentage: 20,
      },
    ];

    expect(ageFieldToReferenceData(ageField, locale)).toEqual(expectedOutput);
  });
});

describe('ageFieldToIncludedUsers', () => {
  it('works', () => {
    const expectedOutput = {
      known: 90,
      total: 100,
      percentage: 90,
    };

    expect(ageFieldToIncludedUsers(ageField)).toEqual(expectedOutput);
  });
});
