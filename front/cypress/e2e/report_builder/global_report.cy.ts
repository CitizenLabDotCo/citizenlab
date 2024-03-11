describe('Global report', () => {
  let reportId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder().then((report) => {
      reportId = report.body.data.id;

      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    });
  });

  it('is possible to create a blank report and edit it', () => {
    // Drag in text widget
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    // Validate it is initialized with empty text
    cy.get('.e2e-text-box').should('contain.text', '');

    // Edit text
    cy.get('div.e2e-text-box').click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').clear().type('Edited', { force: true });

    // Expect this to be visible on screen
    cy.get('.e2e-text-box').should('contain.text', 'Edited');

    // Switch locale
    cy.get('#e2e-locale-select').select('nl-BE');

    // Validate that text for other locale is still empty
    cy.get('.e2e-text-box').should('contain.text', '');

    // Switch back
    cy.get('#e2e-locale-select').select('en');

    // Previous edited text should still be there
    cy.get('.e2e-text-box').should('contain.text', 'Edited');

    // Save report
    cy.get('#e2e-content-builder-topbar-save').click();

    // Refresh page
    cy.reload();

    // Validate that the edited text is still there
    cy.get('.e2e-text-box').should('contain.text', 'Edited');
  });

  after(() => {
    cy.apiRemoveReportBuilder(reportId);
  });
});
