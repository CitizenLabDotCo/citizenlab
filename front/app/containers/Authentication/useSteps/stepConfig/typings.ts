export type Step =
  // shared
  | 'closed'
  | 'success'

  // old sign in flow
  | 'sign-in:auth-providers'
  | 'sign-in:email-password'

  // old sign up flow
  | 'sign-up:auth-providers'
  | 'sign-up:email-password'
  | 'sign-up:email-confirmation'
  | 'sign-up:change-email'
  | 'sign-up:verification'
  | 'sign-up:custom-fields'
  | 'sign-up:invite'
  | 'sign-up:enter-email'

  // light flow
  | 'light-flow:email'
  | 'light-flow:email-policies'
  | 'light-flow:google-policies'
  | 'light-flow:facebook-policies'
  | 'light-flow:azure-ad-policies'
  | 'light-flow:france-connect-login'
  | 'light-flow:email-confirmation'
  | 'light-flow:password'

  // missing data (if signed in already)
  | 'missing-data:built-in'
  | 'missing-data:email-confirmation'
  | 'missing-data:change-email'
  | 'missing-data:verification'
  | 'missing-data:custom-fields'

  // verification only (for onboarding and re-verification)
  | 'verification-only'
  | 'verification-success';

export interface BuiltInFieldsUpdate {
  first_name?: string;
  last_name?: string;
  password?: string;
}
