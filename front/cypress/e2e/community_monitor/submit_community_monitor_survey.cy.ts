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

        cy.apiEditPhase({
          phaseId: communityMonitorPhaseId,
          submission_enabled: true,
        });
      });
    });
  });

  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();
    // Confirm access rights are set to Anyone for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-anyone').should('be.visible');
    cy.get('#e2e-permission-anyone').click({ force: true });
    cy.contains('No actions are required to participate').should('be.visible');
  });

  it('can be submitted by an admin user', () => {
    cy.visit(
      `projects/community-monitor/surveys/new?phase_id=${communityMonitorPhaseId}`
    );

    // First default question
    cy.contains('City as a place to live').should('exist');

    // Select first question
    cy.get('#place_to_live-linear-scale-option-1').click();

    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Service delivery').should('be.visible');
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Governance and trust').should('be.visible');

    // save the form
    cy.dataCy('e2e-submit-form').click({ force: true });
    cy.wait(2000);

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
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Service delivery').should('be.visible');
    cy.dataCy('e2e-next-page').should('be.visible').click({ force: true });
    cy.wait(2000);
    cy.contains('Governance and trust').should('be.visible');

    // save the form
    cy.dataCy('e2e-submit-form').should('be.visible');
    cy.dataCy('e2e-submit-form').click({ force: true });
    cy.wait(2000);

    // Confirm submissions was successful
    cy.get('[data-cy="e2e-after-submission"]').should('exist');
  });

  it('cannot be submitted by a logged out user if permissions require registration', () => {
    cy.setConsentAndAdminLoginCookies();

    // Change the access rights to email confirmation for the community monitor
    cy.visit(`admin/community-monitor/settings/access-rights`);
    cy.get('#e2e-permission-email-confirmed-users').should('be.visible');
    cy.get('#e2e-permission-email-confirmed-users').click({ force: true });
    cy.contains('Confirm your email').should('be.visible');

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
