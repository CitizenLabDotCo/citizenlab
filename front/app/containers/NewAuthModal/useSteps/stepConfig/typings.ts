export type Step =
  // closed (shared)
  | 'closed'

  // old sign in flow
  | 'auth-providers-sign-in'
  | 'email-password-sign-in'

  // old sign up flow
  | 'auth-providers-sign-up'
  | 'email-password-sign-up'
  | 'email-confirmation-old-sign-up-flow'

  // light flow
  | 'light-flow-start'
  | 'email-policies'
  | 'google-policies'
  | 'facebook-policies'
  | 'azure-ad-policies'
  | 'france-connect-login'
  | 'email-confirmation-light-flow'
  | 'enter-password'

  // success (shared)
  | 'success';
