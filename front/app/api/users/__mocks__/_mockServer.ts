import { rest } from 'msw';
import { IUserData } from '../types';

export const usersData: IUserData[] = [
  {
    id: '522ae8cc-a5ed-4d31-9aa0-470904934ec6',
    type: 'user',
    attributes: {
      first_name: 'Test',
      last_name: 'Citizenlab',
      slug: 'test-citizenlab',
      locale: 'en',
      avatar: {
        small: null,
        medium: null,
        large: null,
      },
      roles: [],
      highest_role: 'user',
      bio_multiloc: {},
      registration_completed_at: '2018-11-26T15:40:54.355Z',
      invite_status: null,
      created_at: '2018-11-26T15:41:19.782Z',
      updated_at: '2018-11-26T15:41:19.782Z',
      email: 'test@citizenlab.co',
      confirmation_required: false,
      custom_field_values: {
        birthyear: 1990,
        domicile: 'outside',
        gender: 'female',
        politician: 'retired_politician',
      },
      unread_notifications: 0,
      followings_count: 2,
    },
  },
  {
    id: 'ac3669cf-f1c2-45dd-a8c0-4baf672a6998',
    type: 'user',
    attributes: {
      slug: 'jordan-schimmel',
      locale: 'en',
      roles: [{ type: 'admin' }],
      highest_role: 'admin',
      bio_multiloc: {},
      registration_completed_at: '2023-05-18T07:05:29.164Z',
      invite_status: null,
      blocked: false,
      created_at: '2018-03-28T13:35:02.000Z',
      updated_at: '2023-05-18T07:05:29.206Z',
      last_name: 'Schimmel',
      first_name: 'Jordan',
      no_name: false,
      no_password: false,
      email: 'briana@strackebosco.name',
      custom_field_values: {},
      avatar: { small: null, medium: null, large: null },
      unread_notifications: 0,
      confirmation_required: false,
      verified: false,
      followings_count: 2,
    },
  },
];

export const apiPath = `/web_api/v1/users/:id`;

const endpoints = {
  'GET users/:id': rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: usersData[0] }));
  }),
};

export default endpoints;
