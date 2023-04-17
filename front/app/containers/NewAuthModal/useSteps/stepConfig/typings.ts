export type Step =
  // shared
  | 'closed'
  | 'success'

  // old sign in flow
  | 'sign-in:auth-providers'
  | 'sign-in:email-password'
  | 'sign-in:email-confirmation'
  | 'sign-in:change-email'
  | 'sign-in:verification'
  | 'sign-in:custom-fields'

  // old sign up flow
  | 'sign-up:auth-providers'
  | 'sign-up:email-password'
  | 'sign-up:email-confirmation'
  | 'sign-up:change-email'
  | 'sign-up:verification'
  | 'sign-up:custom-fields'

  // light flow
  | 'light-flow:email'
  | 'light-flow:email-policies'
  | 'light-flow:google-policies'
  | 'light-flow:facebook-policies'
  | 'light-flow:azure-ad-policies'
  | 'light-flow:france-connect-login'
  | 'light-flow:email-confirmation'
  | 'light-flow:password'

  // verification only (for onboarding and re-verification)
  | 'verification-only'
  | 'verification-success';
