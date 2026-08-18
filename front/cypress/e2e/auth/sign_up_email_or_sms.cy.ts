import {
  acceptPolicies,
  confirmEmail,
  confirmPhone,
  enterPassword,
  enterPhone,
  enterUserInfo,
  signUpEmailConformation,
  signUpPhoneConfirmation,
} from '../../support/auth';
import {
  randomEmail,
  randomPhoneNumber,
  randomString,
} from '../../support/commands';
import { createNativeSurveyProjectWithPermission } from './utils';

// 'either_email_or_phone' lets the participant pick: whichever of the two they
// confirm satisfies the requirement, and nothing is asked about the other one.
describe('Sign up - either email or SMS', () => {
  let projectId = '';
  const projectTitle = randomString();

  // A second project whose action does require an email address, used to check
  // what happens to a participant who signed up with a phone number only.
  let emailOnlyProjectId = '';
  const emailOnlyProjectTitle = randomString();

  const startFlow = (title: string = projectTitle) => {
    cy.visit(`/projects/${title}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });
  };

  const expectSurveyOpened = (title: string = projectTitle) => {
    cy.location('pathname').should('eq', `/en/projects/${title}/surveys/new`);
  };

  before(() => {
    createNativeSurveyProjectWithPermission({
      projectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_email: false,
        require_confirmed_phone_number: false,
      },
    }).then(({ projectId: id }) => {
      projectId = id;
    });
    createNativeSurveyProjectWithPermission({
      projectTitle: emailOnlyProjectTitle,
      permissionBody: {
        permitted_by: 'users',
        require_confirmed_email: true,
      },
    }).then(({ projectId: id }) => {
      emailOnlyProjectId = id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveProject(emailOnlyProjectId);
  });

  it('works when signing up with a new email address', () => {
    startFlow();

    signUpEmailConformation(cy);
    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    expectSurveyOpened();
    cy.logout();
  });

  it('works when signing up with a new phone number', () => {
    startFlow();

    signUpPhoneConfirmation(cy);
    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    expectSurveyOpened();
    cy.logout();
  });

  it('fails when the wrong confirmation code is used', () => {
    startFlow();

    enterPhone(cy);
    acceptPolicies(cy);

    // Confirm phone number with the wrong code
    cy.dataCy('phone-code-input').find('input').type('9999');
    cy.dataCy('phone-confirm-button').click();

    cy.get('.e2e-error-message')
      .first()
      .should('include.text', 'Invalid confirmation code.');
  });

  it('allows changing the phone number before confirming it', () => {
    startFlow();

    enterPhone(cy);
    acceptPolicies(cy);

    // On the confirmation step, go back to enter a different number
    cy.dataCy('go-to-change-phone').click();

    signUpPhoneConfirmation(cy);
    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    expectSurveyOpened();
    cy.logout();
  });

  it('allows requesting a new confirmation code', () => {
    startFlow();

    enterPhone(cy);
    acceptPolicies(cy);

    cy.dataCy('resend-code').click();
    cy.dataCy('confirmation-code-sent-message').should('exist');

    confirmPhone(cy);
    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    expectSurveyOpened();
    cy.logout();
  });

  it('asks for an email address when the next action requires one', () => {
    startFlow();

    signUpPhoneConfirmation(cy);
    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();
    expectSurveyOpened();

    // The account has no email address, so an action that requires one asks for
    // it (and nothing else - the name and password are already known).
    startFlow(emailOnlyProjectTitle);

    cy.get('#e2e-built-in-fields-container').should('exist');
    cy.get('#e2e-firstName-container').should('not.exist');
    cy.get('#email').type(randomEmail());
    cy.get('#e2e-built-in-fields-submit-button > button').click({
      force: true,
    });

    confirmEmail(cy);

    cy.get('#e2e-success-continue-button').click();

    expectSurveyOpened(emailOnlyProjectTitle);
    cy.logout();
  });

  describe('when logging back in with the phone number', () => {
    const phone = randomPhoneNumber().national;
    const password = randomString();

    before(() => {
      startFlow();

      signUpPhoneConfirmation(cy, phone);
      enterUserInfo(cy, { password });

      cy.get('#e2e-success-continue-button').click();

      expectSurveyOpened();
      cy.logout();
    });

    it('works with the correct password', () => {
      startFlow();

      enterPhone(cy, phone);
      enterPassword(cy, password);

      expectSurveyOpened();
      cy.logout();
    });

    it('fails with the wrong password', () => {
      startFlow();

      enterPhone(cy, phone);
      enterPassword(cy, randomString());

      cy.get('.e2e-error-message').should(
        'contain',
        'The provided information is not correct'
      );
    });
  });
});
