import { randomString } from '../../support/commands';
import moment = require('moment');

function addTextWidget() {
  cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
    position: 'inside',
  });

  cy.wait(1000);

  cy.get('div.e2e-text-box').last().click('center');
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
  let ideationPhaseId: string;
  let surveyPhaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
      projectSlug = '';
      currentInfoPhaseId = '';
      futureInfoPhaseId = '';
      ideationPhaseId = '';
      surveyPhaseId = '';
    }

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
        ideationPhaseId = phase.body.data.id;
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
          title: randomString(),
          startAt: moment().subtract(29, 'day').format('DD/MM/YYYY'),
          endAt: moment().subtract(20, 'day').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        surveyPhaseId = phase.body.data.id;
        cy.apiCreateSurveyQuestions(surveyPhaseId, [
          'page',
          'select',
          'multiselect',
        ]);

        return cy.apiCreatePhase({
          projectId,
          title: currentInfoPhaseTitle,
          startAt: moment().subtract(19, 'day').format('DD/MM/YYYY'),
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
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  const reportShouldNotBeVisible = (report: any) => {
    const reportId = report.body.data.id;

    cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

    addTextWidget();
    saveReport(reportId);

    // Go to phase report, ensure it doesn't exist anywhere
    cy.visit(`/projects/${projectSlug}/4`);
    cy.get('.e2e-phase-description').contains(futureInfoPhaseTitle);
    cy.get('#e2e-phase-report').should('not.exist');

    cy.visit(`/projects/${projectSlug}/3`);
    cy.get('.e2e-phase-description').contains(currentInfoPhaseTitle);
    cy.get('#e2e-phase-report').should('not.exist');

    // Clean up
    cy.apiRemoveReportBuilder(reportId);
  };

  it('is not visible if in future phase', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(futureInfoPhaseId).then((report) => {
      reportShouldNotBeVisible(report);
    });
  });

  it('is not visible in current phase if visibility toggle set to false', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(currentInfoPhaseId, false).then((report) => {
      reportShouldNotBeVisible(report);
    });
  });

  const reportShouldBeVisible = () => {
    // Go to phase report, ensure it doesn't exist in future phase
    cy.visit(`/projects/${projectSlug}/4`);
    cy.get('.e2e-phase-description').contains(futureInfoPhaseTitle);
    cy.get('#e2e-phase-report').should('not.exist');

    // Make sure it does exist in current phase
    cy.visit(`/projects/${projectSlug}/3`);
    cy.get('.e2e-phase-description').contains(currentInfoPhaseTitle);
    cy.get('#e2e-phase-report').should('exist').contains('Edited text.');
  };

  context('when report is visible', () => {
    it('is visible in current phase when created from scratch', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder(currentInfoPhaseId, true).then((report) => {
        const reportId = report.body.data.id;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        addTextWidget();

        // Add participation
        cy.get('#e2e-draggable-participation-widget').dragAndDrop(
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

        saveReport(reportId);

        reportShouldBeVisible();

        // Make sure widget is also there
        cy.get('.e2e-participation-widget').should('exist');
        cy.contains('New Widget Title').should('exist');

        // Make sure report is visible for logged out users
        cy.logout();
        cy.reload();
        reportShouldBeVisible();

        // Make sure widget is also there
        cy.get('.e2e-participation-widget').should('exist');
        cy.contains('New Widget Title').should('exist');

        // Clean up
        cy.apiRemoveReportBuilder(reportId);
      });
    });

    // inspired by front/cypress/e2e/report_builder/idea_template.cy.ts
    // "autosaves report created from template"
    it('is visible in current phase when created from ideation template', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder(currentInfoPhaseId, true).then((report) => {
        const reportId = report.body.data.id;
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.visit(
          `/admin/reporting/report-builder/${reportId}/editor?templatePhaseId=${ideationPhaseId}`
        );

        // Wait for autosave
        // We expect the save button to indicate that the report is saved (has svg icon)
        cy.get('#e2e-content-builder-topbar-save > button > svg').should(
          'exist'
        );

        addTextWidget();

        // Now we save again
        saveReport(reportId);

        reportShouldBeVisible();
        cy.contains('Total inputs: 1').should('exist');

        // Make sure report is visible for logged out users
        cy.logout();
        cy.reload();
        reportShouldBeVisible();
        cy.contains('Total inputs: 1').should('exist');

        // Clean up
        cy.apiRemoveReportBuilder(reportId);
      });
    });

    // inspired by front/cypress/e2e/report_builder/survey_template.cy.ts
    it('is visible in current phase when created from survey template', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder(currentInfoPhaseId, true).then((report) => {
        const reportId = report.body.data.id;
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.visit(
          `/admin/reporting/report-builder/${reportId}/editor?templatePhaseId=${surveyPhaseId}`
        );

        // Wait for autosave
        // We expect the save button to indicate that the report is saved (has svg icon)
        cy.get('#e2e-content-builder-topbar-save > button > svg').should(
          'exist'
        );

        addTextWidget();

        // Now we save again
        saveReport(reportId);

        reportShouldBeVisible();
        cy.contains('0/0 - Multiple choice').should('exist');

        // Make sure report is visible for logged out users
        cy.logout();
        cy.reload();
        reportShouldBeVisible();
        cy.contains('0/0 - Multiple choice').should('exist');

        // Clean up
        cy.apiRemoveReportBuilder(reportId);
      });
    });
  });
});
