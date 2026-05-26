import { fakeSSOSignup } from './utils';

describe('SSO: user with unconfirmed email', () => {
  it('signs the user in after a round-trip through the fake OIDC provider', () => {
    fakeSSOSignup(cy, 'jane_doe');

    // Expect to be on email confirmation step
    // TODO
  });
});
