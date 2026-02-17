import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import {
  updatePermission,
  confirmUserCustomFieldHasValue,
  addPermissionsCustomField,
  setupProject,
} from '../../support/permitted_by_utils';
import { fillOutTitleAndBody } from './_utils';

describe('Ideation permitted by: everyone', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let fieldName = '';
  let userId: string | undefined;
  let answer: string | undefined;

  before(() => {
    // Create custom field
    setupProject({ participationMethod: 'ideation' }).then((data) => {
      customFieldId = data.customFieldId;
      customFieldKey = data.customFieldKey;
      projectId = data.projectId;
      projectSlug = data.projectSlug;
      phaseId = data.phaseId;
      fieldName = data.fieldName;

      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone',
          }).then(() => {
            return addPermissionsCustomField({
              adminJwt,
              phaseId,
              customFieldId,
            });
          });
        });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveCustomField(customFieldId);

    if (userId) {
      cy.apiRemoveUser(userId);
    }
  });

  const inForm = () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    const title = randomString(11);
    const body = randomString(40);

    fillOutTitleAndBody(cy, { title, body });

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
  };

  describe('As a visitor', () => {
    it('works', () => {
      inForm();

      // Skip to demographic question page
      cy.wait(1000);
      cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

      // Confirm we are on demographic question page
      cy.get('form').contains(fieldName);

      // Fill in demographic question
      const answer = randomString(10);
      cy.get('form').find('input').first().type(answer);

      // Intercept submit request
      cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');

      // Submit survey
      cy.dataCy('e2e-submit-form').click();

      // Make sure request body contains custom field value
      cy.wait('@submitSurvey').then((interception) => {
        const ideaPayload = interception.request.body.idea;
        expect(ideaPayload[`u_${customFieldKey}`]).to.eq(answer);
      });

      // Now we should be on last page
      cy.dataCy('e2e-after-submission').should('exist');
    });
  });

  describe('As a user with name and confirmed email', () => {
    const createUser = () => {
      if (userId) {
        cy.logout();
        cy.apiRemoveUser(userId);
      }

      const userFirstName = randomString(10);
      const userLastName = randomString(10);
      const userPassword = randomString(10);
      const userEmail = randomEmail();

      cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
        (response) => {
          cy.setLoginCookie(userEmail, userPassword);
          cy.setConsentCookie();
          userId = response.body.data.id;
        }
      );
    };

    beforeEach(() => {
      createUser();
    });

    const confirmSavedToProfile = (expectedAnswer: string | undefined) => {
      confirmUserCustomFieldHasValue({
        key: customFieldKey,
        value: expectedAnswer,
      });
    };

    describe('Non-anonymous user', () => {
      it('stores custom fields in profile', () => {
        inForm();

        // Go to the next page of the idea form
        cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

        // Confirm we are on demographic question page
        cy.get('form').contains(fieldName);

        // Fill in demographic question
        answer = randomString(10);
        cy.get('form').find('input').first().type(answer);

        // Intercept submit request
        cy.intercept('POST', '/web_api/v1/ideas').as('submitIdea');

        // Submit survey
        cy.dataCy('e2e-submit-form').click();
        cy.wait('@submitIdea');

        confirmSavedToProfile(answer);
      });
    });

    describe('Anonymous user', () => {
      it('does not store custom fields in profile', () => {
        inForm();

        // Go to the next page of the idea form
        cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

        // Confirm we are on demographic question page
        cy.get('form').contains(fieldName);

        // Fill in demographic question
        answer = randomString(10);
        cy.get('form').find('input').first().type(answer);

        // set to anonymous
        cy.get('[data-testid="e2e-post-idea-anonymously-checkbox"]').click();
        cy.get('#e2e-continue-anonymous-participation-btn').click();

        // Intercept submit request
        cy.intercept('POST', '/web_api/v1/ideas').as('submitIdea');

        // Submit survey
        cy.dataCy('e2e-submit-form').click();
        cy.wait('@submitIdea');

        confirmSavedToProfile(undefined);
      });
    });
  });
});
