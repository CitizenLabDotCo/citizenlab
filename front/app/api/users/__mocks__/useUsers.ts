import { IUser } from '../types';

import { usersData } from './_mockServer';

export const makeUser = (attributes = {}, id?: string): IUser => {
  return {
    data: {
      id: id ? id : '522ae8cc-a5ed-4d31-9aa0-470904934ec6',
      type: 'user',
      attributes: {
        first_name: 'Test',
        last_name: 'Go Vocal',
        slug: 'test-govocal',
        locale: 'en',
        avatar: {
          small: null,
          medium: null,
          large: null,
        },
        roles: [],
        highest_role: 'user',
        bio_multiloc: {
          en: 'I am a test user',
        },
        registration_completed_at: '2018-11-26T15:40:54.355Z',
        invite_status: null,
        created_at: '2018-11-26T15:41:19.782Z',
        updated_at: '2018-11-26T15:41:19.782Z',
        email: 'test@govocal.com',
        confirmation_required: false,
        custom_field_values: {
          birthyear: 1990,
          domicile: 'outside',
          gender: 'female',
          politician: 'retired_politician',
        },
        unread_notifications: 0,
        followings_count: 2,
        ...attributes,
      },
    },
  };
};

export const makeAdmin = (attributes = {}): IUser => {
  return makeUser({
    roles: [{ type: 'admin' }],
    highest_role: 'admin',
    ...attributes,
  });
};

export const makeSuperAdmin = (attributes = {}): IUser => {
  return makeAdmin({
    highest_role: 'super_admin',
    ...attributes,
  });
};

export default jest.fn(() => {
  return { data: { data: usersData } };
});
