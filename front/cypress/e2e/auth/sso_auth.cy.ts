import { randomEmail, randomString } from '../../support/commands';
import moment = require('moment');

/* 
  This test only works locally when you run the fake SSO server on the same docker network (see the bit where it navigates to http://host.docker.internal:8081/oauth/authorize). 
  
  To make this work with our e2e tests on CircleCI requires some devops work.
*/
describe.skip('SSO authentication', () => {
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
        '/en/?sso_success=true&sso_flow=signup&sso_verification_action=visiting&sso_verification_type=global'
      );

      // Make sure that custom fields window is opened
      cy.get('#e2e-signup-custom-fields-container');

      // Skip custom fields
      cy.get('#e2e-signup-custom-fields-skip-btn').click();

      // Make sure we're at success screen
      cy.get('#e2e-sign-up-success-modal').should('exist');
    });

    it('Asks for email if email is missing', () => {
      cy.visit('/');

      cy.get('#e2e-navbar-login-menu-item').click();
      cy.get('#e2e-login-with-fake-sso').click();

      // Now we are on the fake-sso page
      cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
        // Select profile without email
        cy.get('select#profile-select').select('jane_doe');
        cy.get('#submit-button').click();
      });

      // See test above
      cy.location('pathname').should('eq', '/en/');
      cy.visit(
        '/en/?sso_success=true&sso_flow=signup&sso_verification_action=visiting&sso_verification_type=global'
      );

      // Make sure we have to enter email
      cy.get('#e2e-built-in-fields-container').should('exist');
      cy.get('input#email').focus().type(randomEmail());
      cy.get('#e2e-built-in-fields-submit-button').click();

      // Make sure we can confirm email
      cy.get('input#code').focus().type('1234');
      cy.get('#e2e-verify-email-button').click();

      // Make sure that custom fields window is opened
      cy.get('#e2e-signup-custom-fields-container');
    });
  });

  describe('Action sign up', () => {
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

          cy.get('.e2e-action-accordion-posting_idea').click();

          cy.get('.e2e-action-form-posting_idea').within(() => {
            // Establish there are four custom fields using the delete button
            cy.get('.e2e-delete-custom-field').should('have.length', 4);

            // // Delete custom field number 4
            cy.get('.e2e-delete-custom-field').eq(3).click();
            cy.get('.e2e-delete-custom-field').should('have.length', 3);

            // // Delete custom field number 3
            cy.get('.e2e-delete-custom-field').eq(2).click();
            cy.get('.e2e-delete-custom-field').should('have.length', 2);
          });

          cy.logout();
        });
    });

    it("Doesn't show custom fields step if all fields are returned by SSO", () => {
      cy.visit(`/en/projects/${projectSlug}`);

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      cy.get('#e2e-login-with-fake-sso').click();
      cy.get('#e2e-terms-and-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-container .e2e-checkbox').click();
      cy.get('.e2e-sso-continue-button').first().click();

      // Now we are on the fake-sso page
      cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
        cy.get('#submit-button').click();
      });

      // Make sure we're redirected back to the correct page
      cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);

      // Now something goes wrong with cypress: we are on the correct page,
      // but the token is not set for some reason. This can be solved
      // by manually doing the redirect another time.
      // No idea why it works like this, but it does.
      cy.visit(
        `http://localhost:3000/en/projects/${projectSlug}?sso_success=true&sso_flow=signup&sso_verification_action=posting_idea&sso_verification_id=${phaseId}&sso_verification_type=phase`
      );

      // Make sure we're at success screen
      cy.get('#e2e-sign-up-success-modal').should('exist');
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });
  });
});
