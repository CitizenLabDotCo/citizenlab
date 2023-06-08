import { randomString, randomEmail } from '../../../support/commands';

describe('Report builder Reactions By Time widget', () => {
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
          const email = randomEmail();
          const password = randomString();
          cy.apiSignup(randomString(), randomString(), email, password).then(
            (user) => {
              cy.wrap((user as any).body.data.id).as('userId');
              cy.apiDislikeIdea(email, password, idea.body.data.id);
            }
          );
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
    cy.get<string>('@userId').then((userId) => {
      cy.apiRemoveUser(userId);
    });
  });

  it('handles Reactions By Time widget correctly', function () {
    cy.get('#e2e-draggable-reactions-by-time-widget').dragAndDrop(
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

    // Confirms that button displays and functions correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    cy.visit(`/admin/reporting/report-builder/${this.reportId}/viewer`);
    cy.get('.recharts-surface:first').trigger('mouseover');

    cy.contains('New Widget Title').should('exist');
    cy.contains('Dislikes : 1').should('be.visible');
  });

  it('deletes Reactions By Time widget correctly', function () {
    cy.get('#e2e-draggable-reactions-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.get('#e2e-draggable-reactions-by-time-widget').should('exist');
    cy.get('#e2e-draggable-reactions-by-time-widget')
      .parent()
      .click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`/admin/reporting/report-builder/${this.reportId}/viewer`);
    cy.get('#e2e-reactions-by-time-widget').should('not.exist');
  });
});
