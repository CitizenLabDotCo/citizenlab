import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import {
  updatePermission,
  confirmUserCustomFieldHasValue,
  addPermissionsCustomField,
  setupProject,
} from '../../support/permitted_by_utils';
import { fillOutTitleAndBody } from './_utils';

describe('Ideation permitted by: users', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let fieldName = '';
  let userId: string | undefined;
  let ideaId: string | undefined;
  let answer: string | undefined;

  before(() => {
    setupProject().then((data) => {
      customFieldId = data.customFieldId;
      customFieldKey = data.customFieldKey;
      projectId = data.projectId;
      projectSlug = data.projectSlug;
      phaseId = data.phaseId;
      fieldName = data.fieldName;

      // Temporarily set permission to everyone_confirmed_email
      // to make sure we clear out the global settings
      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone_confirmed_email',
          }).then(() => {
            // Add one permissions custom field
            return addPermissionsCustomField({
              adminJwt,
              phaseId,
              customFieldId,
            }).then(() => {
              // Set permission back to users
              return updatePermission({
                adminJwt,
                phaseId,
                permitted_by: 'users',
              });
            });
          });
        });
    });
  });

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

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveCustomField(customFieldId);

    if (userId) {
      cy.apiRemoveUser(userId);
    }
  });

  describe('In reg flow', () => {
    const inRegFlow = () => {
      cy.visit(`/projects/${projectSlug}`);

      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // Modal should show demographic question
      cy.get('#e2e-authentication-modal').contains(fieldName);

      // Fill in demographic question
      answer = randomString(10);
      cy.get('#e2e-authentication-modal').find('input').first().type(answer);

      // Click submit and 'continue'
      cy.get('#e2e-signup-custom-fields-submit-btn').click();
      cy.get('#e2e-success-continue-button').click();

      const title = randomString(11);
      const body = randomString(40);

      fillOutTitleAndBody(cy, { title, body });

      // Go to the next page of the idea form
      cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
    };

    describe('Non-anonymous user', () => {
      it('stores user custom fields in idea', () => {
        inRegFlow();

        // Intercept submit request
        cy.intercept('POST', '/web_api/v1/ideas').as('submitIdea');

        // Submit form
        cy.dataCy('e2e-submit-form').click();
        cy.wait('@submitIdea').then((interception) => {
          ideaId = interception.response?.body.data.id;
        });

        // make sure custom field value is stored in idea
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return cy
            .request({
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminJwt}`,
              },
              method: 'GET',
              url: `web_api/v1/ideas/${ideaId}`,
            })
            .then((response) => {
              // Make sure data was saved
              const attributes = response.body.data.attributes;
              expect(attributes[`u_${customFieldKey}`]).to.eq(answer);

              // Make sure user is also linked
              expect(response.body.data.relationships.author?.data?.id).to.eq(
                userId
              );
            });
        });
      });
    });

    describe('Anonymous user', () => {
      it('does not store user custom fields in idea', () => {
        inRegFlow();

        // set to anonymous
        cy.get('[data-testid="e2e-post-idea-anonymously-checkbox"]').click();
        cy.get('#e2e-continue-anonymous-participation-btn').click();

        // Intercept submit request
        cy.intercept('POST', '/web_api/v1/ideas').as('submitIdea');

        // Submit idea
        cy.dataCy('e2e-submit-form').click();
        cy.wait('@submitIdea').then((interception) => {
          ideaId = interception.response?.body.data.id;
        });

        // make sure custom field value is not stored in idea
        // check if custom field value is stored in idea
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return cy
            .request({
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminJwt}`,
              },
              method: 'GET',
              url: `web_api/v1/ideas/${ideaId}`,
            })
            .then((response) => {
              // Make it clear the idea has no demographic data saved,
              // since anonymity was selected
              const attributes = response.body.data.attributes;
              expect(attributes[`u_${customFieldKey}`]).to.eq(undefined);

              // And of course there should also be no user linked
              expect(response.body.data.relationships.author?.data?.id).to.eq(
                undefined
              );
            });
        });
      });
    });
  });

  describe('In form', () => {
    before(() => {
      cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
        const adminJwt = response.body.jwt;

        return updatePermission({
          adminJwt,
          phaseId,
          user_fields_in_form: true,
        });
      });
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
