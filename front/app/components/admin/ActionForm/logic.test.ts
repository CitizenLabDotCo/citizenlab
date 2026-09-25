import { FormatMessage } from 'typings';

import { IPermissionData } from 'api/permissions/types';

import { buildSummary, getVisibleSecurityRequirements } from './logic';

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
  phoneUpsell: false,
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
      // Three cases, driven by password login and the SMS feature:
      // - Password login on, SMS on: a real toggle, and a summary entry when
      //   required.
      // - Password login on, SMS off: a disabled toggle (upsell), never in the
      //   summary.
      // - Password login off: not shown at all, whatever the SMS feature.
      describe('when password login and SMS are both enabled', () => {
        it('is a configurable requirement, not an upsell', () => {
          const visible = getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: true,
            passwordLoginEnabled: true,
          });

          expect(visible.phone).toBe(true);
          expect(visible.phoneUpsell).toBe(false);
        });
      });

      describe('when password login is enabled but SMS is not', () => {
        it('is shown as an upsell, but not as a configurable requirement', () => {
          const visible = getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled: false,
            passwordLoginEnabled: true,
          });

          expect(visible.phone).toBe(false);
          expect(visible.phoneUpsell).toBe(true);
        });

        it('is an upsell whatever else is enabled', () => {
          const visible = getVisibleSecurityRequirements({
            smsEnabled: false,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
            verificationMethodEnabled: true,
            passwordLoginEnabled: true,
          });

          expect(visible.phone).toBe(false);
          expect(visible.phoneUpsell).toBe(true);
        });
      });

      describe('when password login is disabled', () => {
        it.each([true, false])('is not shown at all (sms=%p)', (smsEnabled) => {
          const visible = getVisibleSecurityRequirements({
            smsEnabled,
            smsLoginEnabled: true,
            hasAuthMethodNotReturningEmail: true,
            verificationMethodEnabled: true,
            passwordLoginEnabled: false,
          });

          expect(visible.phone).toBe(false);
          expect(visible.phoneUpsell).toBe(false);
        });
      });

      it('is configurable even if SMS login is disabled', () => {
        const visible = getVisibleSecurityRequirements({
          ...ALL_DISABLED,
          smsEnabled: true,
          smsLoginEnabled: false,
          passwordLoginEnabled: true,
        });

        expect(visible.phone).toBe(true);
        expect(visible.phoneUpsell).toBe(false);
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
        ).toEqual({ ...NONE_VISIBLE, password: true, phoneUpsell: true });
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
        [
          false,
          false,
          false,
          false,
          true,
          { ...NONE_VISIBLE, password: true, phoneUpsell: true },
        ],
        [false, false, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          false,
          false,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, password: true, phoneUpsell: true },
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
          {
            ...NONE_VISIBLE,
            verification: true,
            password: true,
            phoneUpsell: true,
          },
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
          {
            ...NONE_VISIBLE,
            email: true,
            verification: true,
            password: true,
            phoneUpsell: true,
          },
        ],
        [false, true, false, false, false, NONE_VISIBLE],
        [
          false,
          true,
          false,
          false,
          true,
          { ...NONE_VISIBLE, password: true, phoneUpsell: true },
        ],
        [false, true, false, true, false, { ...NONE_VISIBLE, email: true }],
        [
          false,
          true,
          false,
          true,
          true,
          { ...NONE_VISIBLE, email: true, password: true, phoneUpsell: true },
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
          {
            ...NONE_VISIBLE,
            verification: true,
            password: true,
            phoneUpsell: true,
          },
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
          {
            ...NONE_VISIBLE,
            email: true,
            verification: true,
            password: true,
            phoneUpsell: true,
          },
        ],
        [true, false, false, false, false, { ...NONE_VISIBLE }],
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
          { ...NONE_VISIBLE, phone: true, verification: true, password: true },
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
            phoneUpsell: false,
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
            phoneUpsell: false,
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
            phoneUpsell: false,
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

  describe('buildSummary', () => {
    const formatMessage = ((message: { defaultMessage: string }) =>
      message.defaultMessage) as unknown as FormatMessage;

    const permission = {
      id: 'perm-1',
      type: 'permission',
      attributes: {
        permitted_by: 'users',
        user_data_collection: 'all_data',
        require_confirmed_email: false,
        require_confirmed_phone_number: true,
        require_name: false,
        require_password: false,
        require_verification: false,
      },
      relationships: { groups: { data: [] } },
    } as unknown as IPermissionData;

    const summaryKeys = (
      visible: ReturnType<typeof getVisibleSecurityRequirements>
    ) =>
      buildSummary(permission, [], formatMessage, visible).map(
        (chip) => chip.key
      );

    describe('the phone requirement', () => {
      it('is summarised when password login and SMS are both enabled', () => {
        const visible = getVisibleSecurityRequirements({
          ...ALL_DISABLED,
          smsEnabled: true,
          passwordLoginEnabled: true,
        });

        expect(summaryKeys(visible)).toContain('phone');
      });

      it('is not summarised when password login is enabled but SMS is not', () => {
        const visible = getVisibleSecurityRequirements({
          ...ALL_DISABLED,
          smsEnabled: false,
          passwordLoginEnabled: true,
        });

        expect(summaryKeys(visible)).not.toContain('phone');
      });

      it.each([true, false])(
        'is not summarised when password login is disabled (sms=%p)',
        (smsEnabled) => {
          const visible = getVisibleSecurityRequirements({
            ...ALL_DISABLED,
            smsEnabled,
            passwordLoginEnabled: false,
          });

          expect(summaryKeys(visible)).not.toContain('phone');
        }
      );
    });
  });
});
