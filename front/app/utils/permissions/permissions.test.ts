import { makeAdmin, makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import { renderHook } from 'utils/testUtils/rtl';

import { usePermission, usePermissionCheck } from '.';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));
jest.mock('api/app_configuration/useAppConfiguration');

const settingsRoute = { type: 'route', path: '/admin/settings/general' };
const projectsRoute = { type: 'route', path: '/admin/projects' };

describe('usePermissionCheck', () => {
  it('checks several items with the rules for the current user', () => {
    mockAuthUser = makeUser({
      highest_role: 'project_moderator',
      roles: [{ type: 'project_moderator', project_id: 'project-1' }],
    });

    const can = renderHook(() => usePermissionCheck()).result.current;

    expect(can({ item: settingsRoute, action: 'access' })).toBe(false);
    expect(can({ item: projectsRoute, action: 'access' })).toBe(true);
  });

  it('agrees with usePermission', () => {
    mockAuthUser = makeAdmin();

    const can = renderHook(() => usePermissionCheck()).result.current;
    const allowed = renderHook(() =>
      usePermission({ item: settingsRoute, action: 'access' })
    ).result.current;

    expect(can({ item: settingsRoute, action: 'access' })).toBe(allowed);
    expect(allowed).toBe(true);
  });
});
