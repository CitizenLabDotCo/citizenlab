import { randomString } from '../../support/commands';

describe('create community monitor report', () => {
  before(() => {
    cy.setConsentAndAdminLoginCookies();
  });

  it('can create report from community monitor template', () => {
    cy.visit(`admin/community-monitor/reports`);

    // Can create new report using community monitor template
    cy.contains('Create a report').should('be.visible').click();
    cy.get('.e2e-create-report-modal-title-input').type(randomString());

    // Select community monitor template
    cy.get('#community-monitor-template-radio').click({ force: true });

    // Select year + quarter
    cy.get('#e2e-year-select').select('2025');
    cy.get('#e2e-quarter-select').select('Quarter 2');

    // Create report
    cy.get('[data-testid="create-report-button"]').click();

    // Confirms that report is populated with data
    cy.get('#e2e-health-score-widget').should('be.visible');
    cy.get('.e2e-sentiment-question').first().should('be.visible');
  });
});
