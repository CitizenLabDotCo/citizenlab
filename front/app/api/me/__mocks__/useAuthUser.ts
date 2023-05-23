import { IUserData } from 'services/users';

const meData: IUserData = {
  id: 'dd3f228f-26dc-4844-8315-8277e8f7676e',
  type: 'user',
  attributes: {
    slug: 'sylvester-kalinoski',
    locale: 'en',
    roles: [{ type: 'admin' }],
    highest_role: 'super_admin',
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
    unread_notifications: 0,
    confirmation_required: false,
    verified: false,
  },
};

export default jest.fn(() => {
  return { data: { data: meData } };
});
