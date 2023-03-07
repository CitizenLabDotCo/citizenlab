import { randomString } from '../../../support/commands';

describe('Report builder Comments By Time widget', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      type: 'continuous',
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      const projectId = project.body.data.id;
      cy.wrap(projectId).as('projectId');
      cy.apiCreateIdea(projectId, randomString(), randomString()).then(
        (idea) => {
          cy.apiAddComment(idea.body.data.id, 'idea', randomString());
        }
      );
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

  it('handles Comments By Time widget correctly', function () {
    cy.get('#e2e-draggable-comments-by-time-widget').dragAndDrop(
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

  it('deletes Comments By Time widget correctly', function () {
    cy.get('#e2e-draggable-comments-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.get('#e2e-draggable-comments-by-time-widget').should('exist');
    cy.get('#e2e-draggable-comments-by-time-widget')
      .parent()
      .click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`/admin/reporting/report-builder/${this.reportId}/viewer`);
    cy.get('#e2e-comments-by-time-widget').should('not.exist');
  });
});
