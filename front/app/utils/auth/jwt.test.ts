import * as cookies from 'js-cookie';
import { SECURE_COOKIE } from '../cookie';
import { setJwt } from './jwt';

jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe('jwt utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setJwt', () => {
    it('sets cookie with correct security attributes', () => {
      const jwt = 'test-jwt-token';
      const rememberMe = false;

      setJwt(jwt, rememberMe);

      expect(cookies.set).toHaveBeenCalledWith('cl2_jwt', jwt, {
        secure: SECURE_COOKIE,
        sameSite: 'strict',
      });
    });

    it('adds expiration when rememberMe is true', () => {
      const jwt = 'test-jwt-token';
      const rememberMe = true;
      const tokenLifetime = 30; // days

      setJwt(jwt, rememberMe, tokenLifetime);

      expect(cookies.set).toHaveBeenCalledWith('cl2_jwt', jwt, {
        secure: SECURE_COOKIE,
        sameSite: 'strict',
        expires: tokenLifetime,
      });
    });
  });
});
