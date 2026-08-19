import { getVisibleSecurityRequirements } from './logic';

const ALL_DISABLED = {
  smsEnabled: false,
  smsLoginEnabled: false,
  verificationMethodEnabled: false,
  hasAuthMethodNotReturningEmail: false,
  passwordLoginEnabled: false,
};

const NONE_VISIBLE = {
  email: false,
  phone: false,
  verification: false,
  password: false,
};

describe('ActionForm logic', () => {
  describe('getVisibleToggles', () => {
    it('returns no toggles if nothing is enabled', () => {
      expect(getVisibleSecurityRequirements(ALL_DISABLED)).toEqual(
        NONE_VISIBLE
      );
    });

    describe('email', () => {
      it('is shown if participants can sign up with SMS', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            smsLoginEnabled: true,
          }).email
        ).toBe(true);
      });

      it('is shown if an auth method that does not return an email is enabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            hasAuthMethodNotReturningEmail: true,
          }).email
        ).toBe(true);
      });

      it('is hidden if SMS login is enabled but the SMS feature is not', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsLoginEnabled: true,
          }).email
        ).toBe(false);
      });

      it('is hidden if the SMS feature is enabled but SMS login is not', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
          }).email
        ).toBe(false);
      });
    });

    describe('phone', () => {
      it('is shown if the SMS feature and password login are enabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            passwordLoginEnabled: true,
          }).phone
        ).toBe(true);
      });

      it('is shown even if SMS login is disabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            smsLoginEnabled: false,
            passwordLoginEnabled: true,
          }).phone
        ).toBe(true);
      });

      it('is hidden if the SMS feature is disabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
            verificationMethodEnabled: true,
            passwordLoginEnabled: true,
          }).phone
        ).toBe(false);
      });

      it('is hidden if password login is disabled', () => {
        // Phone confirmation codes belong to the password_login flow: with that
        // feature off, nobody can request one, so a confirmed phone number is
        // not something an admin can require.
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            smsLoginEnabled: true,
          }).phone
        ).toBe(false);
      });
    });

    describe('verification', () => {
      it('is shown if a verification method is enabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            verificationMethodEnabled: true,
          })
        ).toEqual({ ...NONE_VISIBLE, verification: true });
      });

      it('is hidden if no verification method is enabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
          }).verification
        ).toBe(false);
      });
    });

    describe('password', () => {
      it('is shown if password login is enabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            passwordLoginEnabled: true,
          })
        ).toEqual({ ...NONE_VISIBLE, password: true });
      });

      it('is hidden if password login is disabled', () => {
        expect(
          getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            smsLoginEnabled: true,
            verificationMethodEnabled: true,
            hasAuthMethodNotReturningEmail: true,
          }).password
        ).toBe(false);
      });
    });

    describe('all combinations', () => {
      // [sms2FA, smsLogin, verificationMethod, authMethodNotReturningEmail, passwordLogin]
      const cases: [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        ReturnType<typeof getVisibleSecurityRequirements>
      ][] = [
        [false, false, false, false, false, NONE_VISIBLE],
        [false, false, false, false, true, { ...NONE_VISIBLE, password: true }],
        [false, false, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          false,
          false,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, password: true },
        ],
        [
          false,
          false,
          true,
          false,
          false,
          { ...NONE_VISIBLE, verification: true },
        ],
        [
          false,
          false,
          true,
          false,
          true,
          { ...NONE_VISIBLE, verification: true, password: true },
        ],
        [
          false,
          false,
          true,
          true,
          false,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [
          false,
          false,
          true,
          true,
          true,
          { ...NONE_VISIBLE, email: true, verification: true, password: true },
        ],
        [false, true, false, false, false, NONE_VISIBLE],
        [false, true, false, false, true, { ...NONE_VISIBLE, password: true }],
        [false, true, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          false,
          true,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, password: true },
        ],
        [
          false,
          true,
          true,
          false,
          false,
          { ...NONE_VISIBLE, verification: true },
        ],
        [
          false,
          true,
          true,
          false,
          true,
          { ...NONE_VISIBLE, verification: true, password: true },
        ],
        [
          false,
          true,
          true,
          true,
          false,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [
          false,
          true,
          true,
          true,
          true,
          { ...NONE_VISIBLE, email: true, verification: true, password: true },
        ],
        [true, false, false, false, false, NONE_VISIBLE],
        [
          true,
          false,
          false,
          false,
          true,
          { ...NONE_VISIBLE, phone: true, password: true },
        ],
        [true, false, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          true,
          false,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, phone: true, password: true },
        ],
        [
          true,
          false,
          true,
          false,
          false,
          { ...NONE_VISIBLE, verification: true },
        ],
        [
          true,
          false,
          true,
          false,
          true,
          {
            ...NONE_VISIBLE,
            phone: true,
            verification: true,
            password: true,
          },
        ],
        [
          true,
          false,
          true,
          true,
          false,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [
          true,
          false,
          true,
          true,
          true,
          {
            email: true,
            phone: true,
            verification: true,
            password: true,
          },
        ],
        [true, true, false, false, false, { ...NONE_VISIBLE, email: true }],
        [
          true,
          true,
          false,
          false,
          true,
          { ...NONE_VISIBLE, email: true, phone: true, password: true },
        ],
        [true, true, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          true,
          true,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, phone: true, password: true },
        ],
        [
          true,
          true,
          true,
          false,
          false,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [
          true,
          true,
          true,
          false,
          true,
          {
            email: true,
            phone: true,
            verification: true,
            password: true,
          },
        ],
        [
          true,
          true,
          true,
          true,
          false,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [
          true,
          true,
          true,
          true,
          true,
          {
            email: true,
            phone: true,
            verification: true,
            password: true,
          },
        ],
      ];

      it.each(cases)(
        'sms2FA=%p smsLogin=%p verificationMethod=%p authMethodNotReturningEmail=%p passwordLogin=%p -> %p',
        (
          smsEnabled,
          smsLoginEnabled,
          verificationMethodEnabled,
          hasAuthMethodNotReturningEmail,
          passwordLoginEnabled,
          expected
        ) => {
          expect(
            getVisibleSecurityRequirements({
              smsEnabled,
              smsLoginEnabled,
              verificationMethodEnabled,
              hasAuthMethodNotReturningEmail,
              passwordLoginEnabled,
            })
          ).toEqual(expected);
        }
      );
    });
  });
});
