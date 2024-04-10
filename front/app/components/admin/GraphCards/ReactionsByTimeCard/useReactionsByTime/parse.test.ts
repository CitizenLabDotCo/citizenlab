import moment from 'moment';

import { ReactionsByTimeResponse } from 'api/graph_data_units/responseTypes';

import { parseTimeSeries } from './parse';

describe('parseTimeSeries', () => {
  it('works', () => {
    const response: ReactionsByTimeResponse = {
      data: {
        type: 'report_builder_data_units',
        attributes: [
          [
            {
              first_dimension_date_created_date: '2021-01-01',
              count_reaction_id: 1,
            },
            {
              first_dimension_date_created_date: '2021-02-01',
              count_reaction_id: 2,
            },
            {
              first_dimension_date_created_date: '2021-03-01',
              count_reaction_id: 3,
            },
          ],
          [
            {
              first_dimension_date_created_date: '2021-01-01',
              count_reaction_id: 4,
            },
            {
              first_dimension_date_created_date: '2021-02-01',
              count_reaction_id: 5,
            },
            {
              first_dimension_date_created_date: '2021-03-01',
              count_reaction_id: 6,
            },
          ],
          [{ count_reaction_id: 21 }],
        ],
      },
    };

    const startAtMoment = moment('2020-12-01');
    const endAtMoment = moment('2021-07-01');
    const resolution = 'month';

    const result = parseTimeSeries(
      response,
      startAtMoment,
      endAtMoment,
      resolution
    );

    const expectedResult = [
      { date: '2020-12-01', likes: 0, dislikes: 0, total: 0 },
      { date: '2021-01-01', likes: 1, dislikes: 4, total: 5 },
      { date: '2021-02-01', likes: 2, dislikes: 5, total: 12 },
      { date: '2021-03-01', likes: 3, dislikes: 6, total: 21 },
      { date: '2021-04-01', likes: 0, dislikes: 0, total: 21 },
      { date: '2021-05-01', likes: 0, dislikes: 0, total: 21 },
      { date: '2021-06-01', likes: 0, dislikes: 0, total: 21 },
      { date: '2021-07-01', likes: 0, dislikes: 0, total: 21 },
    ];

    expect(result).toEqual(expectedResult);
  });
});
