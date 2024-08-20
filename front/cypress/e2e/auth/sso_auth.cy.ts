import { randomString } from '../../support/commands';
import moment = require('moment');

describe('SSO authentication', () => {
  describe('Global log in', () => {
    it('Correctly creates account if no account exists', () => {
      cy.visit('/');

      cy.get('#e2e-navbar-login-menu-item').click();
      cy.get('#e2e-login-with-fake-sso').click();

      // Now we are on the fake-sso page
      cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
        cy.get('#submit-button').click();
      });

      // Make sure we're redirected back to the correct page
      cy.location('pathname').should('eq', '/en/');

      // Now something goes wrong with cypress: we are on the correct page,
      // but the token is not set for some reason. This can be solved
      // by manually doing the redirect another time.
      // No idea why it works like this, but it does.
      cy.visit(
        '/en/complete-signup?sso_response=true&sso_flow=signup&sso_pathname=%2Fen%2F&sso_verification_action=visiting&sso_verification_type=global'
      );

      // Make sure that custom fields window is opened
      cy.get('#e2e-signup-custom-fields-container');

      // Skip custom fields
      cy.get('#e2e-signup-custom-fields-skip-btn').click();

      // Make sure we're at success screen
      cy.get('#e2e-sign-up-success-modal').should('exist');
    });
  });

  describe.only('Action sign up', () => {
    let projectId: string;
    let projectSlug: string;
    let phaseId: string;

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      })
        .then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;

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

          cy.setAdminLoginCookie();
          cy.visit(
            `/admin/projects/${projectId}/phases/${phaseId}/access-rights`
          );

          cy.get('.e2e-action-form-posting_idea')
            .first()
            .within(() => {
              // Establish there are four custom fields using the delete button
              cy.get('.e2e-delete-custom-field').should('have.length', 4);

              // // Delete custom field number 4
              cy.get('.e2e-delete-custom-field').eq(3).click();
              cy.get('.e2e-delete-custom-field').should('have.length', 3);

              // // Delete custom field number 3
              cy.get('.e2e-delete-custom-field').eq(2).click();
              cy.get('.e2e-delete-custom-field').should('have.length', 2);
            });

          cy.wait(10000);

          cy.logout();
        });
    });

    it("Doesn't show custom fields step if all fields are returned by SSO", () => {
      cy.visit(`/en/projects/${projectSlug}`);

      cy.get('.e2e-idea-button').find('button').should('exist');
      cy.get('.e2e-idea-button').find('button').click({ force: true });

      cy.get('#e2e-login-with-fake-sso').click();
      cy.get('#e2e-terms-and-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-container .e2e-checkbox').click();
      cy.get('.e2e-sso-continue-button').first().click();

      // Now we are on the fake-sso page
      cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
        cy.get('#submit-button').click();
      });

      // Make sure we're redirected back to the correct page
      // cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);

      // Now something goes wrong with cypress: we are on the correct page,
      // but the token is not set for some reason. This can be solved
      // by manually doing the redirect another time.
      // No idea why it works like this, but it does.
      cy.visit(
        `http://localhost:3000/en/complete-signup?sso_response=true&sso_flow=signup&sso_pathname=%2Fen%2Fprojects%2F${projectSlug}&sso_verification_action=posting_idea&sso_verification_id=${phaseId}&sso_verification_type=phase`
      );

      // Make sure we're at success screen
      cy.get('#e2e-sign-up-success-modal').should('exist');
    });
  });
});
