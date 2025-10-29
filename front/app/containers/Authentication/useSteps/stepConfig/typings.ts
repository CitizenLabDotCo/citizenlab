export type Step =
  // shared
  | 'closed'
  | 'success'
  | 'access-denied'

  // old sign up flow
  | 'sign-up:email-password'
  | 'sign-up:invite'

  // light flow
  | 'light-flow:email'
  | 'light-flow:email-policies'
  | 'light-flow:sso-policies'
  | 'light-flow:france-connect-login'
  | 'light-flow:email-confirmation'
  | 'light-flow:password'

  // email flow
  | 'email-flow:start'
  | 'email-flow:policies'
  | 'email-flow:password'

  // missing data (if signed in already)
  | 'missing-data:built-in'
  | 'missing-data:email-confirmation'
  | 'missing-data:change-email'
  | 'missing-data:verification'
  | 'missing-data:custom-fields'

  // missing data (if signed in already) for onboarding
  | 'missing-data:onboarding'

  // verification only (for onboarding and re-verification)
  | 'verification-only'
  | 'verification-success'

  // sso verification flow
  | 'sso-verification:sso-providers'
  | 'sso-verification:sso-providers-policies'
  | 'sso-verification:email-password'

  // invite taken flow
  | 'taken-by-invite';

export interface BuiltInFieldsUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}
