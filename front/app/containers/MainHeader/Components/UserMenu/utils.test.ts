import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

import { getUserMenuState } from './utils';

const buildRequirements = (
  authentication: Partial<
    AuthenticationRequirements['requirements']['authentication']
  > = {},
  attributes: Partial<AuthenticationRequirements> = {}
): AuthenticationRequirements => ({
  permitted: true,
  disabled_reason: null,
  requirements: {
    authentication: {
      permitted_by: 'users',
      missing_user_attributes: [],
      email_action_required: null,
      phone_action_required: null,
      ...authentication,
    },
    verification: false,
    custom_fields: {},
    onboarding: false,
    group_membership: false,
  },
  ...attributes,
});

describe('getUserMenuState', () => {
  it('is complete while the requirements are still loading', () => {
    expect(getUserMenuState(undefined)).toBe('complete');
  });

  it('is complete when nothing is outstanding', () => {
    expect(getUserMenuState(buildRequirements())).toBe('complete');
  });

  it('asks to confirm a pending new email', () => {
    expect(
      getUserMenuState(
        buildRequirements({ email_action_required: 'confirm_new_email' })
      )
    ).toBe('confirm-email');
  });

  it('asks to confirm a pending new phone number', () => {
    expect(
      getUserMenuState(
        buildRequirements({ phone_action_required: 'confirm_new_phone' })
      )
    ).toBe('confirm-phone');
  });

  it('asks to complete the profile when the account does not satisfy the permission', () => {
    expect(
      getUserMenuState(
        buildRequirements(
          { missing_user_attributes: ['first_name'] },
          {
            permitted: false,
          }
        )
      )
    ).toBe('complete-profile');
  });

  it('prefers the email confirmation over the other unfinished states', () => {
    expect(
      getUserMenuState(
        buildRequirements(
          {
            email_action_required: 'confirm_new_email',
            phone_action_required: 'confirm_new_phone',
          },
          { permitted: false }
        )
      )
    ).toBe('confirm-email');
  });

  it('leaves the profile links in place for an in-place or stale confirmation', () => {
    // confirm_email is resolved while logged out, and reconfirm_* is a
    // freshness check on a permission - neither locks the profile.
    expect(
      getUserMenuState(
        buildRequirements({ email_action_required: 'confirm_email' })
      )
    ).toBe('complete');
    expect(
      getUserMenuState(
        buildRequirements({ phone_action_required: 'reconfirm_phone' })
      )
    ).toBe('complete');
  });
});
