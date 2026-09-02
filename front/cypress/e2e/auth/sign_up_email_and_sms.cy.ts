import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import {
  randomPhoneNumber,
  randomString,
  randomEmail,
} from '../../support/commands';
import { createNativeSurveyProjectWithPermission, fakeSSOAuth } from './utils';

describe('Sign up - email and SMS (2FA)', () => {
  let projectId = '';
  const projectTitle = randomString();

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_phone_number: true,
      },
    }).then(({ projectId: id }) => {
      projectId = id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('works when signing up with new phone number', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(randomPhoneNumber().national);
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('123456');
    cy.dataCy('phone-confirm-button').click();

    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('fails when the wrong code is used', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(randomPhoneNumber().national);
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('999999');
    cy.dataCy('phone-confirm-button').click();

    // Assert error
    cy.get('.e2e-error-message')
      .first()
      .should('include.text', 'Invalid confirmation code.');
  });

  // 'Wrong number' brings the user back to the input, prefilled with the number
  // they entered. Submitting that same number again is not a resend the backend
  // accepts, but the code it already sent is still valid - so the flow has to
  // carry on to the confirmation step rather than sit there doing nothing.
  it('reaches the confirmation step when the same number is submitted again', () => {
    const phoneNumber = randomPhoneNumber();

    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(phoneNumber.national);
    cy.dataCy('phone-continue-button').click();
    cy.dataCy('phone-code-input').should('exist');

    // Go back to the input, which holds the number that was just entered (the
    // field only shows the national part, formatted, hence the digit compare).
    cy.dataCy('go-to-change-phone').click();
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .invoke('val')
      .should((value) => {
        expect(String(value).replace(/\D/g, '')).to.contain(
          phoneNumber.national
        );
      });

    // Submit it unchanged: no error, and the confirmation step for that same
    // number is reached again.
    cy.dataCy('phone-continue-button').click();

    cy.get('.e2e-error-message').should('not.exist');
    cy.dataCy('confirmation-phone-number')
      .invoke('text')
      .should((text) => {
        expect(text.replace(/\D/g, '')).to.contain(phoneNumber.national);
      });

    // The code sent the first time round still works
    cy.dataCy('phone-code-input').find('input').type('123456');
    cy.dataCy('phone-confirm-button').click();

    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('confirms the new number when it is changed', () => {
    const phoneNumber = randomPhoneNumber();
    const newPhoneNumber = randomPhoneNumber();

    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(phoneNumber.national);
    cy.dataCy('phone-continue-button').click();
    cy.dataCy('phone-code-input').should('exist');

    // Go back and correct the number. A different number is a new request, not a
    // resend, so a code goes out right away.
    cy.dataCy('go-to-change-phone').click();
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .clear()
      .type(newPhoneNumber.national);
    cy.dataCy('phone-continue-button').click();

    cy.get('.e2e-error-message').should('not.exist');
    cy.dataCy('confirmation-phone-number')
      .invoke('text')
      .should((text) => {
        expect(text.replace(/\D/g, '')).to.contain(newPhoneNumber.national);
      });

    cy.dataCy('phone-code-input').find('input').type('123456');
    cy.dataCy('phone-confirm-button').click();

    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('when exit flow after entering phone: on re-entry, correct step is shown', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(randomPhoneNumber().national);
    cy.dataCy('phone-continue-button').click();

    // Refresh page
    cy.reload();

    // Re-enter flow
    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('123456');
    cy.dataCy('phone-confirm-button').click();

    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  });

  describe('if confirmed phone number already exists', () => {
    const phoneNumber = randomPhoneNumber();
    let userId: string;

    before(() => {
      const email = randomEmail();
      const password = randomString();
      cy.apiSignup(randomString(), randomString(), email, password).then(
        (response) => {
          userId = response.body.data.id;

          return cy.apiLogin(email, password).then((response) => {
            const jwt = response.body.jwt;

            return cy
              .request({
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwt}`,
                },
                method: 'POST',
                url: `web_api/v1/user/request_code_new_phone`,
                body: {
                  request_code: { new_phone: phoneNumber.e164 },
                },
              })
              .then(() => {
                return cy.request({
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwt}`,
                  },
                  method: 'POST',
                  url: `web_api/v1/user/confirm_code_new_phone`,
                  body: {
                    confirmation: { code: '123456' },
                  },
                });
              });
          });
        }
      );
    });

    after(() => {
      cy.apiRemoveUser(userId);
    });

    it('fails when entering existing phone number', () => {
      cy.visit(`/projects/${projectTitle}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      signUpEmailConformation(cy);

      // Enter phone number
      cy.dataCy('phone-number-input')
        .find('input[type="tel"]')
        .type(phoneNumber.national);
      cy.dataCy('phone-continue-button').click();

      // Assert error
      cy.get('.e2e-error-message')
        .first()
        .should('include.text', 'This phone number is already taken');
    });
  });
});

describe('Sign up - SSO and SMS (2FA)', () => {
  let projectId = '';
  const projectTitle = randomString();

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_phone_number: true,
        require_confirmed_email: false,
        require_verification: true,
      },
    }).then(({ projectId: id }) => {
      projectId = id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('works after returning from SSO', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    fakeSSOAuth(cy, 'john_doe');

    // Enter phone number
    cy.dataCy('phone-number-input')
      .find('input[type="tel"]')
      .type(randomPhoneNumber().national);
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('123456');
    cy.dataCy('phone-confirm-button').click();

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  });
});
