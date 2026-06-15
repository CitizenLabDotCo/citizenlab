import { passwordMeetsStrength } from './';

describe('passwordMeetsStrength', () => {
  it('returns true when no minimum strength is configured (undefined)', async () => {
    expect(await passwordMeetsStrength('aaaaaaaaaaaa', undefined)).toBe(true);
  });

  it('returns true when the minimum strength is 0 (disabled)', async () => {
    expect(await passwordMeetsStrength('aaaaaaaaaaaa', 0)).toBe(true);
  });

  it('returns false for a weak password when a minimum strength is set', async () => {
    expect(await passwordMeetsStrength('aaaaaaaaaaaa', 3)).toBe(false);
  });

  it('returns true for a strong password that meets the minimum strength', async () => {
    expect(await passwordMeetsStrength('correct horse battery staple', 3)).toBe(
      true
    );
  });
});
