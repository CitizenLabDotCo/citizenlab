import { http, HttpResponse } from 'msw';

import { IUserData } from 'api/users/types';

export const mockAuthUserData: IUserData = {
  id: 'dd3f228f-26dc-4844-8315-8277e8f7676e',
  type: 'user',
  attributes: {
    slug: 'sylvester-kalinoski',
    locale: 'en',
    roles: [{ type: 'admin' }],
    highest_role: 'admin',
    bio_multiloc: {},
    registration_completed_at: '2018-03-28T13:34:57.000Z',
    invite_status: null,
    blocked: false,
    created_at: '2018-03-28T13:34:57.000Z',
    updated_at: '2023-05-18T09:51:35.571Z',
    last_name: 'Kalinoski',
    first_name: 'Sylvester',
    no_name: false,
    no_password: false,
    email: 'admin@citizenlab.co',
    custom_field_values: {},
    avatar: { small: null, medium: null, large: null },
    // Don't put to 0
    unread_notifications: 5,
    confirmation_required: false,
    verified: false,
    followings_count: 2,
  },
};

const endpoints = {
  'GET users/me': http.get('/web_api/v1/users/me', () => {
    return HttpResponse.json({ data: mockAuthUserData }, { status: 200 });
  }),
};

export const loggedOutHandler = http.get('/web_api/v1/users/me', () => {
  return HttpResponse.json(null, { status: 401 });
});

export default endpoints;
