import { IUser } from 'services/users';
import { makeUser } from './users';
import { BehaviorSubject } from 'rxjs';
export const mockUser = {
  data: {
    id: '522ae8cc-a5ed-4d31-9aa0-470904934ec6',
    type: 'users',
    attributes: {
      first_name: 'Test',
      last_name: 'Citizenlab',
      slug: 'test-citizenlab',
      locale: 'en',
      avatar: {
        small: null,
        medium: null,
        large: null
      },
      roles: [],
      highest_role: 'user',
      bio_multiloc: {},
      registration_completed_at: '2018-11-26T15:40:54.355Z',
      invite_status: null,
      created_at: '2018-11-26T15:41:19.782Z',
      updated_at: '2018-11-26T15:41:19.782Z',
      email: 'test@citizenlab.co',
      custom_field_values: {
        birthyear: 1990,
        domicile: 'outside',
        gender: 'female',
        politician: 'retired_politician'
      },
      unread_notifications: 0
    },
    relationships: {
      granted_permissions: {
        data: []
      }
    }
  }
} as IUser;

const adminRole = [{ type: 'admin' }];

function setRoles(roles) {
  const user = mockUser;
  user.data.attributes.roles = roles;
  return user;
}
export const mockAdmin = setRoles(adminRole) as IUser;

export const mockProjectModerator = (projectId: string) => setRoles([{ type: 'project_moderator', project_id: projectId }]) as IUser;

let mockAuthUser: IUser = makeUser();

export const __setMockAuthUser = (user: IUser) => {
  mockAuthUser = user;
};

export const authUserStream = jest.fn(() => {
  const observable = new BehaviorSubject(mockAuthUser);
  return {
    observable
  };
});
