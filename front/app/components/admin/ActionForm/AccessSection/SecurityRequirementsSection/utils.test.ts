import { getVisibleToggles, SecurityRequirementKey } from './utils';

const ALL_DISABLED = {
  sms2FAEnabled: false,
  smsLoginEnabled: false,
  verificationMethodEnabled: false,
  authenticationMethodEnabled: false,
};

describe('SecurityRequirementsSection utils', () => {
  describe('getVisibleToggles', () => {
    it('returns no toggles if nothing is enabled', () => {
      expect(getVisibleToggles(ALL_DISABLED)).toEqual([]);
    });

    describe('email', () => {
      it('is shown if participants can sign up with SMS', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: true,
          })
        ).toContain('email');
      });

      it('is shown if an authentication method is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            authenticationMethodEnabled: true,
          })
        ).toContain('email');
      });

      it('is hidden if SMS login is enabled but the SMS feature is not', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, smsLoginEnabled: true })
        ).not.toContain('email');
      });

      it('is hidden if the SMS feature is enabled but SMS login is not', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, sms2FAEnabled: true })
        ).not.toContain('email');
      });
    });

    describe('phone', () => {
      it('is shown if the SMS feature is enabled', () => {
        expect(
          getVisibleToggles({ ...ALL_DISABLED, sms2FAEnabled: true })
        ).toContain('phone');
      });

      it('is shown even if SMS login is disabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: false,
          })
        ).toContain('phone');
      });

      it('is hidden if the SMS feature is disabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            smsLoginEnabled: true,
            authenticationMethodEnabled: true,
            verificationMethodEnabled: true,
          })
        ).not.toContain('phone');
      });
    });

    describe('verification', () => {
      it('is shown if a verification method is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            verificationMethodEnabled: true,
          })
        ).toEqual(['verification']);
      });

      it('is hidden if no verification method is enabled', () => {
        expect(
          getVisibleToggles({
            ...ALL_DISABLED,
            sms2FAEnabled: true,
            smsLoginEnabled: true,
            authenticationMethodEnabled: true,
          })
        ).not.toContain('verification');
      });
    });

    it('returns the toggles in a fixed order', () => {
      expect(
        getVisibleToggles({
          sms2FAEnabled: true,
          smsLoginEnabled: true,
          verificationMethodEnabled: true,
          authenticationMethodEnabled: true,
        })
      ).toEqual(['email', 'phone', 'verification']);
    });

    describe('all combinations', () => {
      // [sms2FA, smsLogin, verificationMethod, authenticationMethod]
      const cases: [
        boolean,
        boolean,
        boolean,
        boolean,
        SecurityRequirementKey[]
      ][] = [
        [false, false, false, false, []],
        [false, false, false, true, ['email']],
        [false, false, true, false, ['verification']],
        [false, false, true, true, ['email', 'verification']],
        [false, true, false, false, []],
        [false, true, false, true, ['email']],
        [false, true, true, false, ['verification']],
        [false, true, true, true, ['email', 'verification']],
        [true, false, false, false, ['phone']],
        [true, false, false, true, ['email', 'phone']],
        [true, false, true, false, ['phone', 'verification']],
        [true, false, true, true, ['email', 'phone', 'verification']],
        [true, true, false, false, ['email', 'phone']],
        [true, true, false, true, ['email', 'phone']],
        [true, true, true, false, ['email', 'phone', 'verification']],
        [true, true, true, true, ['email', 'phone', 'verification']],
      ];

      it.each(cases)(
        'sms2FA=%p smsLogin=%p verificationMethod=%p authenticationMethod=%p -> %p',
        (
          sms2FAEnabled,
          smsLoginEnabled,
          verificationMethodEnabled,
          authenticationMethodEnabled,
          expected
        ) => {
          expect(
            getVisibleToggles({
              sms2FAEnabled,
              smsLoginEnabled,
              verificationMethodEnabled,
              authenticationMethodEnabled,
            })
          ).toEqual(expected);
        }
      );
    });
  });
});
