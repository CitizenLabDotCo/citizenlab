// filename: front/app/utils/auth/jwt.test.ts
import { setJwt } from './jwt';
import * as cookies from 'js-cookie';

jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

// Import this after mocking js-cookie
import { SECURE_COOKIE } from '../cookie';

describe('jwt utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setJwt', () => {
    it('sets cookie with correct security attributes', () => {
      // Arrange
      const jwt = 'test-jwt-token';
      const rememberMe = false;

      // Act
      setJwt(jwt, rememberMe);

      // Assert
      expect(cookies.set).toHaveBeenCalledWith('cl2_jwt', jwt, {
        secure: SECURE_COOKIE,
        sameSite: 'strict',
      });
    });

    it('adds expiration when rememberMe is true', () => {
      // Arrange
      const jwt = 'test-jwt-token';
      const rememberMe = true;
      const tokenLifetime = 30; // days

      // Act
      setJwt(jwt, rememberMe, tokenLifetime);

      // Assert
      expect(cookies.set).toHaveBeenCalledWith('cl2_jwt', jwt, {
        secure: SECURE_COOKIE,
        sameSite: 'strict',
        expires: tokenLifetime,
      });
    });
  });
});
