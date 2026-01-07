import { signUpEmailConformation, enterUserInfo } from '../../../support/auth';
import { randomString } from '../../../support/commands';

describe('Post Participation Signup: survey', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  const firstName = randomString();
  const lastName = randomString();

  before(() => {
    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;

      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;

          // Set authentication requirement to 'everyone'
          return cy.request({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminJwt}`,
            },
            method: 'PATCH',
            url: `web_api/v1/phases/${phaseId}/permissions/posting_idea`,
            body: {
              permitted_by: 'everyone',
            },
          });
        });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('Allows claiming participation by post-participation signpu', () => {
    cy.visit(`/projects/${projectSlug}`);

    // Click take survey button
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Confirm we're in the survey now
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Answer question and submit
    cy.get('fieldset').first().find('input').first().check({ force: true });
    cy.dataCy('e2e-submit-form').click();

    // Click button to enter post-participation sign up flow
    cy.dataCy('post-participation-signup').click();

    // Sign up
    signUpEmailConformation(cy);
    enterUserInfo(cy, { firstName, lastName });
    cy.get('#e2e-signup-custom-fields-skip-btn').click();
    cy.get('#e2e-success-continue-button').find('button').click();

    // Make sure we get redirected to project
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);

    // Check and confirm that user has submission
    cy.visit(`/en/profile/${firstName}-${lastName}/surveys`);
    cy.get(`a[href="/en/projects/${projectSlug}"]`).should('exist');
  });
});
