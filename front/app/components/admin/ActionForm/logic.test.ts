import { getVisibleToggles } from './logic';

const ALL_DISABLED = {
  sms2FAEnabled: false,
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
      expect(getVisibleToggles(ALL_DISABLED)).toEqual(NONE_VISIBLE);
    });

    describe('email', () => {
      it('is shown if participants can sign up with SMS', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: true,
          }).email
        ).toBe(true);
      });

      it('is shown if an auth method that does not return an email is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            hasAuthMethodNotReturningEmail: true,
          }).email
        ).toBe(true);
      });

      it('is hidden if SMS login is enabled but the SMS feature is not', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, smsLoginEnabled: true }).email
        ).toBe(false);
      });

      it('is hidden if the SMS feature is enabled but SMS login is not', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, sms2FAEnabled: true }).email
        ).toBe(false);
      });
    });

    describe('phone', () => {
      it('is shown if the SMS feature is enabled', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, sms2FAEnabled: true }).phone
        ).toBe(true);
      });

      it('is shown even if SMS login is disabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: false,
          }).phone
        ).toBe(true);
      });

      it('is hidden if the SMS feature is disabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
            verificationMethodEnabled: true,
          }).phone
        ).toBe(false);
      });
    });

    describe('verification', () => {
      it('is shown if a verification method is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            verificationMethodEnabled: true,
          })
        ).toEqual({ ...NONE_VISIBLE, verification: true });
      });

      it('is hidden if no verification method is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
          }).verification
        ).toBe(false);
      });
    });

    describe('password', () => {
      it('is shown if password login is enabled', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, passwordLoginEnabled: true })
        ).toEqual({ ...NONE_VISIBLE, password: true });
      });

      it('is hidden if password login is disabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: true,
            verificationMethodEnabled: true,
            hasAuthMethodNotReturningEmail: true,
          }).password
        ).toBe(false);
      });
    });

    describe('all combinations', () => {
      // [sms2FA, smsLogin, verificationMethod, authMethodNotReturningEmail]
      const cases: [
        boolean,
        boolean,
        boolean,
        boolean,
        ReturnType<typeof getVisibleToggles>
      ][] = [
        [false, false, false, false, NONE_VISIBLE],
        [false, false, false, true, { ...NONE_VISIBLE, email: true }],
        [false, false, true, false, { ...NONE_VISIBLE, verification: true }],
        [
          false,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [false, true, false, false, NONE_VISIBLE],
        [false, true, false, true, { ...NONE_VISIBLE, email: true }],
        [false, true, true, false, { ...NONE_VISIBLE, verification: true }],
        [
          false,
          true,
          true,
          true,
          { ...NONE_VISIBLE, email: true, verification: true },
        ],
        [true, false, false, false, { ...NONE_VISIBLE, phone: true }],
        [
          true,
          false,
          false,
          true,
          { ...NONE_VISIBLE, email: true, phone: true },
        ],
        [
          true,
          false,
          true,
          false,
          { ...NONE_VISIBLE, phone: true, verification: true },
        ],
        [
          true,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, phone: true, verification: true },
        ],
        [
          true,
          true,
          false,
          false,
          { ...NONE_VISIBLE, email: true, phone: true },
        ],
        [
          true,
          true,
          false,
          true,
          { ...NONE_VISIBLE, email: true, phone: true },
        ],
        [
          true,
          true,
          true,
          false,
          { ...NONE_VISIBLE, email: true, phone: true, verification: true },
        ],
        [
          true,
          true,
          true,
          true,
          { ...NONE_VISIBLE, email: true, phone: true, verification: true },
        ],
      ];

      it.each(cases)(
        'sms2FA=%p smsLogin=%p verificationMethod=%p authMethodNotReturningEmail=%p -> %p',
        (
          sms2FAEnabled,
          smsLoginEnabled,
          verificationMethodEnabled,
          hasAuthMethodNotReturningEmail,
          expected
        ) => {
          expect(
            getVisibleToggles({
              sms2FAEnabled,
              smsLoginEnabled,
              verificationMethodEnabled,
              hasAuthMethodNotReturningEmail,
              passwordLoginEnabled: false,
            })
          ).toEqual(expected);
        }
      );
    });
  });
});
