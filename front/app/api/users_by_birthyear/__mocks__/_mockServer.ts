import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';
import { IUsersByBirthyear } from '../types';

export const apiPath = `${API_PATH}/stats/users_by_birthyear`;

export const usersByBirthyear: IUsersByBirthyear = {
  data: {
    type: 'report_builder_data_units',
    attributes: {
      series: {
        users: {
          1908: 1,
          1980: 1,
          1985: 1,
          1987: 1,
          2000: 1,
          2005: 1,
          2006: 1,
          2010: 1,
          _blank: 42,
        },
      },
    },
  },
};

const endpoints = {
  'GET stats/users_by_birthyear': rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(usersByBirthyear));
  }),
};

export default endpoints;
