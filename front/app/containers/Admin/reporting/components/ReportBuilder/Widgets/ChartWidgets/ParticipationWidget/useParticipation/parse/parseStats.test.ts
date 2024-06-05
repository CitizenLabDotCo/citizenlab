import { ParticipationResponse } from 'api/graph_data_units/responseTypes/ParticipationWidget';

import { parseStats } from './parseStats';

describe('parseStats', () => {
  it('works without compared period', () => {
    const attributes: ParticipationResponse['data']['attributes'] = [
      [
        { count: 1, first_dimension_date_created_date: '2022-10-5' },
        { count: 2, first_dimension_date_created_date: '2022-12-04' },
      ],
      [
        { count: 3, first_dimension_date_created_date: '2022-10-5' },
        { count: 4, first_dimension_date_created_date: '2022-12-04' },
      ],
      [
        { count: 5, first_dimension_date_created_date: '2022-10-5' },
        { count: 6, first_dimension_date_created_date: '2022-12-04' },
      ],
      undefined,
      undefined,
      undefined,
    ];

    expect(parseStats(attributes)).toEqual({
      inputs: {
        value: 3,
        delta: undefined,
      },
      comments: {
        value: 7,
        delta: undefined,
      },
      votes: {
        value: 11,
        delta: undefined,
      },
    });
  });

  it('works with compared period', () => {
    const attributes: ParticipationResponse['data']['attributes'] = [
      [
        { count: 1, first_dimension_date_created_date: '2022-10-5' },
        { count: 2, first_dimension_date_created_date: '2022-12-04' },
      ],
      [
        { count: 3, first_dimension_date_created_date: '2022-10-5' },
        { count: 4, first_dimension_date_created_date: '2022-12-04' },
      ],
      [
        { count: 5, first_dimension_date_created_date: '2022-10-5' },
        { count: 6, first_dimension_date_created_date: '2022-12-04' },
      ],
      [{ count: 1 }],
      [{ count: 2 }],
      [{ count: 3 }],
    ];

    expect(parseStats(attributes)).toEqual({
      inputs: {
        value: 3,
        delta: 2,
      },
      comments: {
        value: 7,
        delta: 5,
      },
      votes: {
        value: 11,
        delta: 8,
      },
    });
  });
});
