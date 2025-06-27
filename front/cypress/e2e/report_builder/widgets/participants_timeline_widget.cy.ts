import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Report builder Participants timeline widget', () => {
  let projectId: string;
  let projectSlug: string;
  let reportId: string;
  let phaseId: string;

  beforeEach(() => {
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
        projectSlug = project.body.data.attributes.slug;

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
      })
      .then(() => {
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(29, 'day').format('DD/MM/YYYY'),
          participationMethod: 'information',
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        cy.setAdminLoginCookie();

        cy.apiCreateReportBuilder(phaseId).then((report) => {
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
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  afterEach(() => {
    if (reportId) {
      cy.apiRemoveReportBuilder(reportId);
    }
  });

  it('handles Participants timeline widget correctly', function () {
    cy.get('#e2e-draggable-participants-widget').dragAndDrop(
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

    // Set date range and compare with previous period
    cy.get('.e2e-statistic-delta').should('not.exist');

    cy.get('.date-range-picker-from').first().click();
    cy.wait(1000);
    cy.get('.rdp-years_dropdown').first().select('2024');
    cy.wait(1000);
    cy.get('.rdp-week')
      .eq(3)
      .find('.rdp-day_button')
      .first()
      .click({ force: true });

    // Close picker again
    cy.get('.date-range-picker-from').first().click();

    // cy.get('#e2e-content-builder-settings').click();

    cy.wait(1000);

    cy.get('#e2e-compare-previous-period-toggle').parent().click();
    cy.get('.e2e-statistic-delta').should('exist');

    // Confirms that the widget displays correctly on live report
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('.recharts-surface:first').trigger('mouseover');

    cy.contains('New Widget Title').should('exist');
    cy.contains('Participants: ').should('exist');

    cy.get('.e2e-statistic-delta').should('exist');
  });

  it('deletes Participants timeline widget correctly', function () {
    cy.get('#e2e-draggable-participants-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    cy.reload();

    cy.get('.e2e-participants-timeline-widget').should('exist');
    cy.get('.e2e-participants-timeline-widget').parent().click({ force: true });

    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`projects/${projectSlug}`);
    cy.get('.e2e-participants-timeline-widget').should('not.exist');
  });
});
