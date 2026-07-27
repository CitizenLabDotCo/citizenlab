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
  | 'email:unauthenticated-confirmation'

  // confirmation steps (code entry for email / phone)
  | 'confirmation:reconfirm-email'
  | 'confirmation:new_email'
  | 'confirmation:reconfirm-phone'
  | 'confirmation:new_phone'

  // invite flow
  | 'invite:email-password'
  | 'invite:code'
  | 'invite:taken'

  // missing data (if signed in already)
  | 'missing-data:change-new-email'
  | 'missing-data:new_phone'
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
