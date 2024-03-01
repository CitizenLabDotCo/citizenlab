import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Report builder Posts By Time widget', () => {
  let projectId: string;
  let reportId: string;

  before(() => {
    cy.setAdminLoginCookie();

    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const phaseTitle = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
          allow_anonymous_participation: true,
        });
      })
      .then((phase) => {
        cy.apiCreateIdea({
          projectId,
          ideaTitle,
          ideaContent,
          phaseIds: [phase.body.data.id],
        });
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateReportBuilder().then((report) => {
      reportId = report.body.data.id;
      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  afterEach(() => {
    cy.apiRemoveReportBuilder(reportId);
  });

  it('handles Posts By Time widget correctly', function () {
    cy.get('#e2e-draggable-posts-by-time-widget').dragAndDrop(
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

    cy.wait(1000);

    // Set project filter
    cy.get('#e2e-report-builder-project-filter-box select').select(projectId);

    // Confirms that the widget displays correctly on live report
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    cy.visit(`/admin/reporting/report-builder/${reportId}/editor?preview=true`);
    cy.get('.recharts-surface:first').trigger('mouseover');

    cy.contains('New Widget Title').should('exist');
    cy.contains('Total : 1').should('exist');
  });

  it('deletes Posts By Time widget correctly', function () {
    cy.get('#e2e-draggable-posts-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.get('#e2e-draggable-posts-by-time-widget').should('exist');
    cy.get('#e2e-draggable-posts-by-time-widget')
      .parent()
      .click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`/admin/reporting/report-builder/${reportId}/editor?preview=true`);
    cy.get('#e2e-posts-by-time-widget').should('not.exist');
  });
});
