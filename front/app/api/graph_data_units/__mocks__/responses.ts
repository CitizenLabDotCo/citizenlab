const reactionsByTimeLive = {
  params:
    '?resolved_name=ReactionsByTimeWidget&props%5Bresolution%5D=month&props%5BendAt%5D=2023-11-03',
  response: {
    data: {
      type: 'report_builder_data_units',
      attributes: [
        [
          {
            'dimension_date_created.month': '2023-05',
            first_dimension_date_created_date: '2023-05-30',
            sum_likes_count: 2,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-07',
            first_dimension_date_created_date: '2023-07-25',
            sum_likes_count: 1,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-08',
            first_dimension_date_created_date: '2023-08-17',
            sum_likes_count: 1,
            sum_dislikes_count: 1,
          },
          {
            'dimension_date_created.month': '2023-09',
            first_dimension_date_created_date: '2023-09-19',
            sum_likes_count: 1,
            sum_dislikes_count: 1,
          },
          {
            'dimension_date_created.month': '2023-10',
            first_dimension_date_created_date: '2023-10-11',
            sum_likes_count: 6,
            sum_dislikes_count: 3,
          },
          {
            'dimension_date_created.month': '2023-11',
            first_dimension_date_created_date: '2023-11-09',
            sum_likes_count: 5,
            sum_dislikes_count: 5,
          },
        ],
        [
          {
            sum_reactions_count: 26,
          },
        ],
      ],
    },
  },
};

export const liveResponses = {
  [reactionsByTimeLive.params]: reactionsByTimeLive.response,
};
