import getAuthUser from '../auth_user/getAuthUser';

import signIn from './signIn';
import signOut from './signOut';

jest.mock('./signOut', () => jest.fn());
jest.mock('../auth_user/getAuthUser', () => jest.fn());
jest.mock('utils/cl-react-query/resetQueryCache', () => ({
  invalidateQueryCache: jest.fn(),
}));

const mockGetAuthUser = getAuthUser as jest.Mock;
const mockSignOut = signOut as jest.Mock;

const credentials = { email: 'user@example.com', password: 'secret' };

describe('signIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the signed-in user', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const user = { data: { id: 'user-id' } };
    mockGetAuthUser.mockResolvedValue(user);

    await expect(signIn(credentials)).resolves.toBe(user);
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // No cookie was set, so there is nothing to undo: signing out would also redirect
  // away from the page the user is on.
  it('does not sign out when the credentials are wrong', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(signIn(credentials)).rejects.toThrow('status 404');
    expect(mockGetAuthUser).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('signs out once when the user cannot be loaded after signing in', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    mockGetAuthUser.mockRejectedValue(new Error('500'));

    await expect(signIn(credentials)).rejects.toThrow('not_authenticated');
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
