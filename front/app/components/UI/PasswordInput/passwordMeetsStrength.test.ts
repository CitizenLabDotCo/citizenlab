import { passwordMeetsStrength, passwordUserInputs } from './';

// NOTE: These tests match the backend tests found in back/spec/models/user_spec.rb
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

  it('penalises a password built from the provided user inputs', async () => {
    // Strong on its own, but worthless if it is just the user's own name.
    const password = 'supercalifragilistic';
    expect(await passwordMeetsStrength(password, 3)).toBe(true);
    expect(await passwordMeetsStrength(password, 3, [password])).toBe(false);
  });
});

describe('passwordUserInputs', () => {
  it('collects present fields and drops empty/missing ones', () => {
    expect(
      passwordUserInputs({
        email: 'a@b.com',
        first_name: 'Ada',
        last_name: null,
      })
    ).toEqual(['Ada', 'a@b.com']);
  });

  it('returns an empty array when given nothing', () => {
    expect(passwordUserInputs()).toEqual([]);
  });
});
