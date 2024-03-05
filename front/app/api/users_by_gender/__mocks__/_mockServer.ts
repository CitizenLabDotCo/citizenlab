import { rest } from 'msw';

import { IUsersByCustomField } from 'api/users_by_custom_field/types';

import { API_PATH } from 'containers/App/constants';

export const apiPath = `${API_PATH}/stats/users_by_gender`;

export const usersByGender: IUsersByCustomField = {
  data: {
    type: 'users_by_custom_field',
    attributes: {
      series: {
        users: {
          male: 5,
          female: 2,
          unspecified: 1,
          _blank: 3,
        },
        reference_population: null,
      },
      options: {
        male: {
          title_multiloc: {
            en: 'Male',
          },
          ordering: 0,
        },
        female: {
          title_multiloc: {
            en: 'Female',
          },
          ordering: 1,
        },
        unspecified: {
          title_multiloc: {
            en: 'Other',
          },
          ordering: 2,
        },
      },
    },
  },
};

const endpoints = {
  'GET stats/users_by_gender': rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(usersByGender));
  }),
};

export default endpoints;
