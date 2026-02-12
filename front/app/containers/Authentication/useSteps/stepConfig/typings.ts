export type Step =
  // shared
  | 'closed'
  | 'success'
  | 'access-denied'

  // email flow
  | 'email:start'
  | 'email:policies'
  | 'email:password'
  | 'email:sso-policies'
  | 'email:confirmation'

  // invite flow
  | 'invite:email-password'
  | 'invite:code'
  | 'invite:taken'

  // missing data (if signed in already)
  | 'missing-data:built-in'
  | 'missing-data:email-confirmation'
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

  // post-participation flow (sign up after participation)
  | 'post-participation:email'

  // claim token consent window
  | 'claim-token-consent';

export interface BuiltInFieldsUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}
