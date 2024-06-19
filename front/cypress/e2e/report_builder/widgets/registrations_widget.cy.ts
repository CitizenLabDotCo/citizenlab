describe('Report builder: Registrations widget', () => {
  let reportId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder().then((report) => {
      reportId = report.body.data.id;
      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.intercept('GET', `/web_api/v1/reports/${reportId}`).as(
        'getReportLayout'
      );
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    });
  });

  after(() => {
    cy.apiRemoveReportBuilder(reportId);
  });

  it('should be able to add Registrations widget', () => {
    cy.get('#e2e-draggable-registrations-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.wait(1000);

    // Change widget title
    cy.get('#e2e-analytics-chart-widget-title')
      .clear()
      .type('New Widget Title');

    cy.contains('New Widget Title').should('exist');
  });
});
