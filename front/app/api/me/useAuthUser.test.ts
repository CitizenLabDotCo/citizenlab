import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import signOut from 'api/authentication/sign_in_out/signOut';
import { HighestRole, IUserAttributes } from 'api/users/types';

import { getJwt, decode } from 'utils/auth/jwt';

import { mockAuthUserData } from './__mocks__/_mockServer';
import { fetchMe } from './useAuthUser';

jest.mock('utils/auth/jwt', () => ({
  getJwt: jest.fn(),
  decode: jest.fn(),
}));

jest.mock('api/authentication/sign_in_out/signOut', () => jest.fn());

const apiPath = '*users/me';
const server = setupServer();

const respondWith = (attributes: Partial<IUserAttributes>) => {
  server.use(
    http.get(apiPath, () => {
      return HttpResponse.json(
        {
          data: {
            ...mockAuthUserData,
            attributes: { ...mockAuthUserData.attributes, ...attributes },
          },
        },
        { status: 200 }
      );
    })
  );
};

describe('fetchMe', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  beforeEach(() => {
    jest.mocked(getJwt).mockReturnValue('a-jwt');
    jest.mocked(decode).mockReturnValue({
      sub: mockAuthUserData.id,
      highest_role: 'user',
      exp: 0,
    });
    jest.mocked(signOut).mockClear();
  });

  it('returns the user when the roles array agrees with the token', async () => {
    respondWith({ roles: [], highest_role: 'user' });

    const result = await fetchMe();

    expect(result?.data.id).toBe(mockAuthUserData.id);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when the response highest_role disagrees with the token', async () => {
    jest.mocked(decode).mockReturnValue({
      sub: mockAuthUserData.id,
      highest_role: 'admin',
      exp: 0,
    });
    respondWith({ roles: [{ type: 'admin' }], highest_role: 'user' });

    const result = await fetchMe();

    expect(result).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  // A super admin who moves off a Go Vocal email keeps their roles, so the back end
  // never rotates their token and it goes on claiming super_admin.
  it('signs out when only the token still claims super admin', async () => {
    jest.mocked(decode).mockReturnValue({
      sub: mockAuthUserData.id,
      highest_role: 'super_admin',
      exp: 0,
    });
    respondWith({ roles: [{ type: 'admin' }], highest_role: 'admin' });

    const result = await fetchMe();

    expect(result).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  it('signs out when the response claims a role the token does not', async () => {
    respondWith({ roles: [{ type: 'admin' }], highest_role: 'user' });

    const result = await fetchMe();

    expect(result).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  it('signs out when the response claims a project moderator role the token does not', async () => {
    respondWith({
      roles: [{ type: 'project_moderator', project_id: 'project-1' }],
      highest_role: 'user',
    });

    const result = await fetchMe();

    expect(result).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  it('accepts an admin roles entry on a super admin token', async () => {
    jest.mocked(decode).mockReturnValue({
      sub: mockAuthUserData.id,
      highest_role: 'super_admin',
      exp: 0,
    });
    respondWith({ roles: [{ type: 'admin' }], highest_role: 'super_admin' });

    const result = await fetchMe();

    expect(result?.data.attributes.highest_role).toBe('super_admin');
    expect(signOut).not.toHaveBeenCalled();
  });

  // The back end can add a role tier before this frontend knows it. Signing those
  // users out would lock them out for good, since the next login mints the same claim.
  it('keeps the session on a role tier this frontend does not know yet', async () => {
    const futureRole = 'tenant_moderator' as HighestRole;

    jest.mocked(decode).mockReturnValue({
      sub: mockAuthUserData.id,
      highest_role: futureRole,
      exp: 0,
    });
    respondWith({ roles: [], highest_role: futureRole });

    const result = await fetchMe();

    expect(result?.data.id).toBe(mockAuthUserData.id);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('returns null without a token', async () => {
    jest.mocked(getJwt).mockReturnValue(null);
    respondWith({ roles: [], highest_role: 'user' });

    expect(await fetchMe()).toBeNull();
  });

  it('signs out when the token cannot be decoded', async () => {
    jest.mocked(decode).mockImplementation(() => {
      throw new Error('malformed');
    });
    respondWith({ roles: [], highest_role: 'user' });

    const result = await fetchMe();

    expect(result).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });
});
