import {
  clearClaimTokens,
  storeClaimToken,
  getUnexpiredClaimTokens,
} from './claimToken';

describe('Claim token flow', () => {
  beforeEach(() => {
    clearClaimTokens();
    localStorage.clear();
  });

  it('stores a claim token', () => {
    const token = {
      token: 'test-token-123',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
    };

    storeClaimToken(token);

    const storedTokens = getUnexpiredClaimTokens();
    expect(storedTokens).toHaveLength(1);
    expect(storedTokens[0]).toEqual(token);
  });

  it('does not return expired claim tokens', () => {
    const expiredToken = {
      token: 'expired-token',
      expirationDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    };
    const validToken = {
      token: 'valid-token',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
    };

    storeClaimToken(expiredToken);
    storeClaimToken(validToken);

    const unexpiredTokens = getUnexpiredClaimTokens();
    expect(unexpiredTokens).toHaveLength(1);
    expect(unexpiredTokens[0].token).toBe('valid-token');
  });

  it('does not overwrite existing claim tokens', () => {
    const token1 = {
      token: 'token-1',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
    const token2 = {
      token: 'token-2',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
    const duplicateToken1 = {
      token: 'token-1',
      expirationDate: new Date(Date.now() + 2000 * 60 * 60).toISOString(), // Different expiration
    };

    storeClaimToken(token1);
    storeClaimToken(token2);
    storeClaimToken(duplicateToken1); // Should not overwrite token-1

    const storedTokens = getUnexpiredClaimTokens();
    expect(storedTokens).toHaveLength(2);
    expect(storedTokens.map((t) => t.token)).toEqual(['token-1', 'token-2']);
    // Verify the original expiration date is preserved
    expect(storedTokens[0].expirationDate).toBe(token1.expirationDate);
  });

  it('clears claim tokens', () => {
    const token1 = {
      token: 'token-1',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };
    const token2 = {
      token: 'token-2',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };

    storeClaimToken(token1);
    storeClaimToken(token2);

    expect(getUnexpiredClaimTokens()).toHaveLength(2);

    clearClaimTokens();

    expect(getUnexpiredClaimTokens()).toHaveLength(0);
  });
});
