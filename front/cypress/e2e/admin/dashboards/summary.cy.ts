describe('/admin route', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/dashboard/overview');
  });

  it('Shows the summary tab and all its graphs', () => {
    cy.get('.intercom-admin-dashboard-tab-overview.active').contains(
      'Overview'
    );
    cy.get('#e2e-registrations-by-time-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('#e2e-participants-by-time-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('#e2e-ideas-chart');
    cy.get('#e2e-comments-chart');
    cy.get('#e2e-reactions-chart');
    cy.get('.e2e-resource-by-topic-chart');
    cy.get('.e2e-resource-by-project-chart');
  });
});
