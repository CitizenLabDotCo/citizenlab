import { randomString } from '../../../support/commands';

describe('Report builder Posts By Time widget', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();

    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      const projectId = project.body.data.id;
      cy.wrap(projectId).as('projectId');
      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
    });

    cy.apiCreateReportBuilder().then((report) => {
      const reportId = report.body.data.id;
      cy.wrap(reportId).as('reportId');
      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    });
  });

  afterEach(() => {
    cy.get<string>('@reportId').then((reportId) => {
      cy.apiRemoveReportBuilder(reportId);
    });
    cy.get<string>('@projectId').then((projectId) => {
      cy.apiRemoveProject(projectId);
    });
  });

  it('handles Posts By Time widget correctly', function () {
    cy.get('#e2e-draggable-posts-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Change widget title
    cy.get('#e2e-analytics-chart-widget-title')
      .clear()
      .type('New Widget Title');

    // Set project filter
    cy.get('#e2e-report-builder-project-filter-box select').select(
      this.projectId
    );

    // Confirms that the widget displays correctly on live report
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    cy.visit(`/admin/reporting/report-builder/${this.reportId}/viewer`);
    cy.get('.recharts-surface:first').trigger('mouseover');

    cy.contains('New Widget Title').should('exist');
    cy.contains('Total : 1').should('be.visible');
  });

  it('deletes Posts By Time widget correctly', function () {
    cy.get('#e2e-draggable-posts-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.get('#e2e-draggable-posts-by-time-widget').should('exist');
    cy.get('#e2e-draggable-posts-by-time-widget')
      .parent()
      .click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`/admin/reporting/report-builder/${this.reportId}/viewer`);
    cy.get('#e2e-posts-by-time-widget').should('not.exist');
  });
});
