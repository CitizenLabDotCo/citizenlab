import { randomString } from '../../support/commands';
import moment = require('moment');

/* 
  This test only works locally when you run the fake SSO server on the same docker network (see the bit where it navigates to http://host.docker.internal:8081/oauth/authorize). 
  
  To make this work with our e2e tests on CircleCI requires some devops work.
*/
describe.skip('Verified action', () => {
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

        cy.intercept(`**/phases/${phaseId}/permissions/posting_idea`).as(
          'setPermissionRequest'
        );

        // Select verified action
        cy.setAdminLoginCookie();
        cy.visit(
          `/admin/projects/${projectId}/phases/${phaseId}/access-rights`
        );

        cy.get('.e2e-action-accordion-posting_idea').click();

        cy.get('.e2e-action-form-posting_idea').within(() => {
          cy.get('.e2e-permission-verified-actions').click();
        });

        cy.wait('@setPermissionRequest').then(() => {
          cy.logout();
        });
      });
  });

  it('Does not ask for email when no email is returned by SSO', () => {
    cy.visit(`/en/projects/${projectSlug}`);

    cy.get('.e2e-idea-button').find('button').should('exist');
    cy.get('.e2e-idea-button').find('button').click({ force: true });

    cy.get('#e2e-verified-action-fake-sso-button').click();
    cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
    cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
    cy.get('#e2e-policies-continue button').click();

    // Now we are on the fake-sso page
    cy.origin('http://host.docker.internal:8081/oauth/authorize', () => {
      // Select profile without email
      cy.get('select#profile-select').select('jane_doe');
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

    // Make sure that custom fields window is opened
    cy.get('#e2e-signup-custom-fields-container');

    // Skip custom fields
    cy.get('#e2e-signup-custom-fields-skip-btn').click();

    // Make sure we're at success screen
    cy.get('#e2e-sign-up-success-modal').should('exist');

    // Unfortunately we can't test redirect back to the survey bc the local storage gets lost
    // while cypress switches domains
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
