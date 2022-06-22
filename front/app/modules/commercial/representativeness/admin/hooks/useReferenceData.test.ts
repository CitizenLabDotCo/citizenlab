import { toReferenceData } from './useReferenceData';

describe('toReferenceData', () => {
  it('works (users and expectedUsers have same keys)', () => {
    const usersByField = {
      series: {
        users: {
          id123: 100,
          id456: 300,
        },
        expected_users: {
          id123: 2000,
          id456: 3000,
        },
      },
      options: {
        id123: { en: '123' },
        id456: { en: '456' },
      },
    };

    const expectedOutput = [
      {
        title_multiloc: { en: '123' },
      },
      {
        title_multiloc: { en: '456' },
      },
    ];

    expect();
  });
});
