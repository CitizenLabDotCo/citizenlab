import moment = require('moment');

describe('/admin route', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/dashboard/overview');
  });

  it('Shows the summary tab and all its graphs', () => {
    cy.get('.intercom-admin-dashboard-tab-overview.active').contains(
      'Overview'
    );
    cy.get('.e2e-users-by-time-cumulative-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('#e2e-active-users-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('#e2e-ideas-chart');
    cy.get('#e2e-comments-chart');
    cy.get('#e2e-reactions-chart');
    cy.get('.e2e-resource-by-topic-chart');
    cy.get('.e2e-resource-by-project-chart');
  });

  it('Shows usable controls', () => {
    cy.get('.e2e-open-time-presets').click();
    cy.get('.e2e-preset-items').find('button').last().click();
    cy.get('#e2e-start-date-input').click();
    cy.get('.e2e-start-date-popper').should('be.visible');
    cy.get('#e2e-end-date-input').click();
    cy.get('.e2e-end-date-popper').should('be.visible');
  });
});
