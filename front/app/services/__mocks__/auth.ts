import { IUser } from 'api/users/types';
import { makeUser } from './users';
import { BehaviorSubject } from 'rxjs';

export const mockUser = makeUser();
export const mockAdmin = makeUser({ roles: [{ type: 'admin' }] });

export const mockProjectModerator = (projectId: string) =>
  makeUser({ roles: [{ type: 'project_moderator', project_id: projectId }] });

let mockAuthUser: IUser = makeUser();

export const __setMockAuthUser = (user: IUser) => {
  mockAuthUser = user;
};

export const authUserObservable = new BehaviorSubject(mockAuthUser);

export const authUserStream = jest.fn(() => {
  return {
    observable: authUserObservable,
  };
});

export const authApiEndpoint = '/web_api/v1/users/me';
