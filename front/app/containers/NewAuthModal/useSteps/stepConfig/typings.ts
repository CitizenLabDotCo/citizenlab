export type Step =
  // closed (shared)
  | 'closed'

  // old sign in flow
  | 'sign-in:auth-providers'
  | 'sign-in:email-password'

  // old sign up flow
  | 'sign-up:auth-providers'
  | 'sign-up:email-password'
  | 'sign-up:email-confirmation'

  // light flow
  | 'light-flow:email'
  | 'light-flow:email-policies'
  | 'light-flow:google-policies'
  | 'light-flow:facebook-policies'
  | 'light-flow:azure-ad-policies'
  | 'light-flow:france-connect-login'
  | 'light-flow:email-confirmation'
  | 'light-flow:password'

  // success (shared)
  | 'success';
