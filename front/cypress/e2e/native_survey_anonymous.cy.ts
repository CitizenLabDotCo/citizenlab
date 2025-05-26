import moment = require('moment');
import { randomString } from '../support/commands';

describe('Native survey: no authentication requirements', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    // Create active project with one open ended phase
    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;

      // Set permission to allow anyone to participate
      cy.apiSetPhasePermission({
        phaseId,
        action: 'posting_idea',
        permissionBody: {
          permission: {
            permitted_by: 'everyone',
          },
        },
      });
    });
  });

  it('allows anyone to participate, and shows the idea id upon completion', () => {
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').click();
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Submit survey
    cy.dataCy('e2e-submit-form').click();

    // Check that we're on final page and return to project
    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // Make sure we're back at the project
    cy.url().should('include', `projects/${projectSlug}`);
  });

  after(() => {
    if (!projectId) return;
    cy.apiRemoveProject(projectId);
  });
});

describe('Native survey: anonymous toggle on', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;

  before(() => {
    // Create active project with one open ended phase
    cy.createProjectWithNativeSurveyPhase({
      allow_anonymous_participation: true,
    }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
    });
  });

  it('allows signed in users to participate, and shows the idea id upon completion', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.e2e-idea-button').first().find('button').click();
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Submit survey
    cy.dataCy('e2e-submit-form').click();

    // Check that we're on final page and return to project
    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // Make sure we're back at the project
    cy.url().should('include', `projects/${projectSlug}`);
  });

  after(() => {
    if (!projectId) return;
    cy.apiRemoveProject(projectId);
  });
});
