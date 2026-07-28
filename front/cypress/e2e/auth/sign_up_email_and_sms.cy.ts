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
    cy.dataCy('phone-number-input').find('input').type(randomPhoneNumber());
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('1234');
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
    cy.dataCy('phone-number-input').find('input').type(randomPhoneNumber());
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('9999');
    cy.dataCy('phone-confirm-button').click();

    // Assert error
    cy.get('.e2e-error-message')
      .first()
      .should('include.text', 'Invalid confirmation code.');
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
                  request_code: { new_phone: phoneNumber },
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
                    confirmation: { code: '1234' },
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
      cy.dataCy('phone-number-input').find('input').type(phoneNumber);
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
    cy.dataCy('phone-number-input').find('input').type(randomPhoneNumber());
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('1234');
    cy.dataCy('phone-confirm-button').click();

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
  });
});
