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

  // confirmation steps (code entry for email / new_email / new_phone)
  | 'confirmation:email'
  | 'confirmation:new_email'
  | 'confirmation:new_phone'

  // invite flow
  | 'invite:email-password'
  | 'invite:code'
  | 'invite:taken'

  // missing data (if signed in already)
  | 'missing-data:change-email'
  | 'missing-data:phone'
  | 'missing-data:built-in'
  | 'missing-data:verification'
  | 'missing-data:custom-fields'

  // missing data (if signed in already) for onboarding
  | 'missing-data:onboarding'

  // verification only (for onboarding and re-verification)
  | 'verification-only'
  | 'verification-success'

  // post-participation flow (sign up after participation)
  | 'post-participation:email';

export interface BuiltInFieldsUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}
