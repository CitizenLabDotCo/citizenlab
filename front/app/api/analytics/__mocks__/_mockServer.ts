import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';

const apiPath = `${API_PATH}/analytics`;

const participantsGraphData = {
  type: 'analytics',
  attributes: [
    [
      {
        first_dimension_date_created_date: '2023-08-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 10,
      },
      {
        first_dimension_date_created_date: '2023-09-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 15,
      },
      {
        first_dimension_date_created_date: '2023-10-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 14,
      },
    ],
    [{ count_dimension_user_id: 39 }],
    [{ count_dimension_user_id: 14 }],
    [{ count_visitor_id: 4 }],
    [],
  ],
};

const endpoints = {
  'GET analytics': rest.get(apiPath, (req, res, ctx) => {
    console.log(req.params);
    return res(ctx.status(200), ctx.json({ data: participantsGraphData }));
  }),
};

export default endpoints;
