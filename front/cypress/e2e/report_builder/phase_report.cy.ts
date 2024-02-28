import { randomString } from '../../support/commands';
import moment = require('moment');

function addTextWidget() {
  cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
    position: 'inside',
  });

  cy.wait(1000);

  cy.get('div.e2e-text-box').click('center');
  cy.get('.ql-editor').click();
  cy.get('.ql-editor').type('Edited text.', { force: true });

  cy.wait(1000);
}

function saveReport(reportId: string) {
  cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
    'saveReportLayout'
  );
  cy.get('#e2e-content-builder-topbar-save').click();
  cy.wait('@saveReportLayout');
}

describe('Phase report', () => {
  const currentInfoPhaseTitle = randomString();
  const futureInfoPhaseTitle = randomString();

  let projectId: string;
  let projectSlug: string;
  let currentInfoPhaseId: string;
  let futureInfoPhaseId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiRemoveAllReports();

    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(30, 'day').format('DD/MM/YYYY'),
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
          ideaTitle: randomString(),
          ideaContent: randomString(),
          phaseIds: [phase.body.data.id],
        });
      })
      .then(() => {
        return cy.apiCreatePhase({
          projectId,
          title: currentInfoPhaseTitle,
          startAt: moment().subtract(29, 'day').format('DD/MM/YYYY'),
          endAt: moment().add(10, 'day').format('DD/MM/YYYY'),
          participationMethod: 'information',
        });
      })
      .then((phase) => {
        currentInfoPhaseId = phase.body.data.id;

        return cy.apiCreatePhase({
          projectId,
          title: futureInfoPhaseTitle,
          startAt: moment().add(11, 'day').format('DD/MM/YYYY'),
          endAt: moment().add(30, 'day').format('DD/MM/YYYY'),
          participationMethod: 'information',
        });
      })
      .then((phase) => {
        futureInfoPhaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('is not visible if in future phase', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(futureInfoPhaseId).then((report) => {
      const reportId = report.body.data.id;

      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

      // Add text widget
      addTextWidget();

      // Save report
      saveReport(reportId);

      // Go to phase report, ensure it doesn't exist anywhere
      cy.visit(`/projects/${projectSlug}/3`);
      cy.get('.e2e-phase-description').contains(futureInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('not.exist');

      cy.visit(`/projects/${projectSlug}/2`);
      cy.get('.e2e-phase-description').contains(currentInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('not.exist');

      // Clean up
      cy.apiRemoveReportBuilder(reportId);
    });
  });

  it('is not visible in current phase if visibility toggle set to false', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(currentInfoPhaseId, false).then((report) => {
      const reportId = report.body.data.id;

      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

      // Add text widget
      addTextWidget();

      // Save report
      saveReport(reportId);

      // Go to phase report, ensure it doesn't exist anywhere
      cy.visit(`/projects/${projectSlug}/3`);
      cy.get('.e2e-phase-description').contains(futureInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('not.exist');

      cy.visit(`/projects/${projectSlug}/2`);
      cy.get('.e2e-phase-description').contains(currentInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('not.exist');

      // Clean up
      cy.apiRemoveReportBuilder(reportId);
    });
  });

  it('is visible in current phase if visibility toggle set to true', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(currentInfoPhaseId, true).then((report) => {
      const reportId = report.body.data.id;

      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

      // Add text widget
      addTextWidget();

      // Add posts by time widget
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

      // Expect project to already be selected
      cy.get('#e2e-report-builder-project-filter-box select').should(
        'have.value',
        projectId
      );

      // Save report
      saveReport(reportId);

      // Go to phase report, ensure it doesn't exist in future phase
      cy.visit(`/projects/${projectSlug}/3`);
      cy.get('.e2e-phase-description').contains(futureInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('not.exist');

      // Make sure it does exist in current phase
      cy.visit(`/projects/${projectSlug}/2`);
      cy.get('.e2e-phase-description').contains(currentInfoPhaseTitle);
      cy.get('#e2e-phase-report').should('exist').contains('TextEdited text.');

      // Make sure widget is also there
      cy.get('.recharts-surface:first').trigger('mouseover');
      cy.contains('New Widget Title').should('exist');
      cy.contains('Total : 1').should('exist');

      // Clean up
      cy.apiRemoveReportBuilder(reportId);
    });
  });
});
