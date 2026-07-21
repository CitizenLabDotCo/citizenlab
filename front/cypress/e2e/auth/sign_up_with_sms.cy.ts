import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import {
  randomPhoneNumber,
  randomString,
  randomEmail,
} from '../../support/commands';
import moment = require('moment');

describe('Sign up - email and SMS (2FA)', () => {
  let projectId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let phaseId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.apiSetPhasePermission({
          phaseId,
          permissionBody: {
            permitted_by: 'users',
            require_confirmed_phone_number: true,
          },
          action: 'posting_idea',
        });
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
                url: `web_api/v1/user/request_code_phone_change`,
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
                  url: `web_api/v1/user/confirm_code_phone_change`,
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
      cy.dataCy('phone-number-input').find('input').type(randomPhoneNumber());
      cy.dataCy('phone-continue-button').click();

      // TODO assert error message
      cy.wait(10000);
    });
  });
});
