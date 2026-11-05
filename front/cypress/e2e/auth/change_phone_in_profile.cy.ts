import { confirmPhone } from '../../support/auth';
import {
  randomEmail,
  randomPhoneNumber,
  randomString,
} from '../../support/commands';

describe('Change phone in profile', () => {
  // The number of a user created up front, so it can't be claimed a second time.
  const takenPhone = randomPhoneNumber();

  const goToChangePhonePage = () => {
    cy.visit('/profile/edit');
    cy.get('a[href="/en/profile/change-phone"]').click();
    cy.dataCy('change-phone-submit-button').should('exist');
  };

  // Signing up is not what these tests are about, so it goes through the API.
  // Yields the credentials and the token of the new user.
  const apiSignUp = () => {
    const email = randomEmail();
    const password = randomString();

    return cy
      .apiSignup(randomString(), randomString(), email, password)
      .then((response) => ({ email, password, jwt: response._jwt }));
  };

  const signUpAndGoToChangePhone = () => {
    apiSignUp().then(({ email, password }) => {
      cy.setLoginCookie(email, password);
      goToChangePhonePage();
    });
  };

  // The phone field keeps the calling code out of the input, and the platform
  // country is preselected, so only the national part is typed (see enterPhone).
  const requestCodeFor = (phone: string) => {
    cy.get('input#phone').should('have.attr', 'placeholder');
    cy.get('input#phone').clear().type(phone);
    cy.dataCy('change-phone-submit-button').click();
  };

  const expectConfirmationStep = (phone: { national: string }) => {
    cy.dataCy('phone-code-input').should('exist');
    cy.dataCy('confirmation-phone-number')
      .invoke('text')
      .should((text) => {
        expect(text.replace(/\D/g, '')).to.contain(phone.national);
      });
  };

  const expectUpdateSuccessful = (phone: { e164: string }) => {
    cy.get('.e2e-success-message')
      .first()
      .should(
        'contain.text',
        'Your phone number has been successfully updated.'
      );

    // The form now reports the new number as the one on the account
    cy.contains(phone.e164).should('exist');
  };

  // Closing the confirmation modal cancels the update, so the form has to be
  // reopened from the profile to ask for another code.
  const closeConfirmationModal = () => {
    cy.get('.e2e-modal-close-button').first().click();
    cy.contains('Phone number update has been cancelled.').should('exist');
  };

  // The two endpoints the change-phone page itself calls, so the number ends up
  // confirmed on the account without going through the interface.
  const apiCreateUserWithPhone = (phone: string) => {
    apiSignUp().then(({ jwt }) => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      };

      cy.request({
        headers,
        method: 'POST',
        url: 'web_api/v1/user/request_code_new_phone',
        body: { request_code: { new_phone: phone } },
      });

      // The e2e back-end runs in development, where the code is always 123456.
      cy.request({
        headers,
        method: 'POST',
        url: 'web_api/v1/user/confirm_code_new_phone',
        body: { confirmation: { code: '123456' } },
      });
    });
  };

  before(() => {
    // Somebody else already owns `takenPhone`
    apiCreateUserWithPhone(takenPhone.e164);
  });

  it('allows adding a phone number', () => {
    const phone = randomPhoneNumber();

    signUpAndGoToChangePhone();

    requestCodeFor(phone.national);
    expectConfirmationStep(phone);

    confirmPhone(cy);
    expectUpdateSuccessful(phone);
  });

  it('shows an error if the code is wrong', () => {
    const phone = randomPhoneNumber();

    signUpAndGoToChangePhone();

    requestCodeFor(phone.national);
    expectConfirmationStep(phone);

    cy.dataCy('phone-code-input').find('input').type('999999');
    cy.dataCy('phone-confirm-button').click();

    cy.get('.e2e-error-message')
      .first()
      .should('contain.text', 'Invalid confirmation code.');
  });

  it('shows an error if the phone number is already in use', () => {
    signUpAndGoToChangePhone();

    requestCodeFor(takenPhone.national);

    cy.get('.e2e-error-message')
      .first()
      .should('contain.text', 'This phone number is already in use.');
    cy.dataCy('phone-code-input').should('not.exist');
  });

  // Restarting the flow for the number that is already being confirmed is not an
  // error: the code that was sent is still valid, and the backend refuses to send
  // a second one within the resend interval.
  describe('when the flow is restarted after closing the confirmation modal', () => {
    it('confirms with the previous code when the same number is submitted', () => {
      const phone = randomPhoneNumber();

      signUpAndGoToChangePhone();

      requestCodeFor(phone.national);
      expectConfirmationStep(phone);
      closeConfirmationModal();

      goToChangePhonePage();
      requestCodeFor(phone.national);

      // No new code went out - the confirmation step is reached without an error
      // and is still counting down towards the next resend.
      cy.get('.e2e-error-message').should('not.exist');
      expectConfirmationStep(phone);
      cy.dataCy('resend-code-countdown').should('exist');

      confirmPhone(cy);
      expectUpdateSuccessful(phone);
    });

    it('sends a new code when a different number is submitted', () => {
      const phone = randomPhoneNumber();
      const newPhone = randomPhoneNumber();

      signUpAndGoToChangePhone();

      requestCodeFor(phone.national);
      expectConfirmationStep(phone);
      closeConfirmationModal();

      goToChangePhonePage();
      requestCodeFor(newPhone.national);

      // A different number is a new request, not a resend, so a code goes out
      // right away and the confirmation step is about the new number.
      cy.get('.e2e-error-message').should('not.exist');
      expectConfirmationStep(newPhone);

      confirmPhone(cy);
      expectUpdateSuccessful(newPhone);
    });
  });
});
