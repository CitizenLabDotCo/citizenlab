import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

// What the signed-in user's menu should offer them next. The four states are
// mutually exclusive, and only one of them ('complete') shows the ordinary
// profile links: until the account is usable, the menu offers the single step
// that makes it usable instead.
//
// - 'confirm-email'    a pending `new_email` waiting to be confirmed.
// - 'confirm-phone'    a pending `new_phone` waiting to be confirmed.
// - 'complete-profile' the account does not satisfy the global permission yet
//                      (missing name, password, custom fields, verification...).
// - 'complete'         nothing outstanding.
//
// Only the `confirm_new_*` actions are treated as blocking. `confirm_email` is
// resolved while the user is still logged out, and the `reconfirm_*` actions are
// a permission-level freshness check — neither should lock someone out of their
// own profile.
export type UserMenuState =
  | 'confirm-email'
  | 'confirm-phone'
  | 'complete-profile'
  | 'complete';

export const getUserMenuState = (
  authRequirements: AuthenticationRequirements | undefined
): UserMenuState => {
  if (!authRequirements) return 'complete';

  const { email_action_required, phone_action_required } =
    authRequirements.requirements.authentication;

  if (email_action_required === 'confirm_new_email') return 'confirm-email';
  if (phone_action_required === 'confirm_new_phone') return 'confirm-phone';
  if (!authRequirements.permitted) return 'complete-profile';

  return 'complete';
};
