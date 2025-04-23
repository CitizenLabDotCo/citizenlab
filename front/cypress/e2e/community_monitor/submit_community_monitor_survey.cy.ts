describe('Submit community monitor survey', () => {
  let communityMonitorProjectId: string;
  let communityMonitorPhaseId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiGetCommunityMonitorProject().then((project) => {
      communityMonitorProjectId = project.body.data.id;
      cy.getProjectById(communityMonitorProjectId).then((project) => {
        communityMonitorPhaseId =
          project.body.data.relationships.current_phase.data.id;
      });
    });
  });

  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();
    // Confirm access rights are set to Anyone for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-anyone').click();
  });

  it('can be submitted by an admin user', () => {
    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // First default question
    cy.contains('City as a place to live').should('exist');

    // Select first question
    cy.get('#place_to_live-linear-scale-option-1').click();

    // Go to last page
    cy.contains('Next').should('be.visible').click({ force: true });
    cy.contains('Service delivery').should('be.visible');
    cy.contains('Next').should('be.visible').click({ force: true });
    cy.contains('Governance and trust').should('be.visible');
    cy.contains('Next').should('be.visible').click({ force: true });

    // save the form
    cy.get('[data-cy="e2e-submit-form"]').should('be.visible').click();

    // Confirm submissions was successful
    cy.get('[data-cy="e2e-after-submission"]').should('exist');
  });

  it('can be submitted by a logged out user by default', () => {
    cy.clearAllCookies();
    cy.setConsentCookie();

    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // First default question
    cy.contains('City as a place to live').should('exist');

    // Select first question
    cy.get('#place_to_live-linear-scale-option-1').click();

    // Go to last page
    cy.contains('Next').should('be.visible').click({ force: true });
    cy.contains('Service delivery').should('be.visible');
    cy.contains('Next').should('be.visible').click({ force: true });
    cy.contains('Governance and trust').should('be.visible');
    cy.contains('Next').should('be.visible').click({ force: true });

    // save the form
    cy.get('[data-cy="e2e-submit-form"]').should('be.visible').click();

    // Confirm submissions was successful
    cy.get('[data-cy="e2e-after-submission"]').should('exist');
  });

  it('cannot be submitted by a logged out user if permissions require registration', () => {
    cy.setConsentAndAdminLoginCookies();

    // Change the access rights to email confirmation for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-email-confirmed-users').click();

    // Go to community monitor survey form as logged out user
    cy.clearAllCookies();
    cy.setConsentCookie();
    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // Authentication modal should pop up
    cy.get('#e2e-authentication-modal').should('be.visible');
  });
});
