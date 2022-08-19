import moment = require('moment');

const oneYearAgo = moment().subtract(1, 'year').format('MMMM YYYY');

describe('/admin route', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/dashboard');
  });

  it('Shows the summary tab and all its graphs', () => {
    cy.get('.e2e-resource-tabs').find('.active').contains('Summary');
    cy.get('.e2e-users-by-time-cumulative-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('.e2e-active-users-chart')
      .find('.recharts-wrapper')
      .find('.recharts-surface');
    cy.get('.e2e-ideas-chart');
    cy.get('.e2e-comments-chart');
    cy.get('.e2e-votes-chart');
    cy.get('.e2e-resource-by-topic-chart');
    cy.get('.e2e-resource-by-project-chart');
  });

  it('Shows usable controls', () => {
    cy.get('.e2e-open-time-presets').click();
    cy.get('.e2e-preset-items').find('button').last().click();
    cy.get('.DateInput_input').first().click();
    cy.get('.CalendarMonthGrid').contains(oneYearAgo);
  });
});
