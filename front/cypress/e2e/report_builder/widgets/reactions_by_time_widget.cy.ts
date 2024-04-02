import { randomString, randomEmail } from '../../../support/commands';
import moment = require('moment');

describe('Report builder Reactions By Time widget', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  let reportId: string;
  let userId: string;

  before(() => {
    cy.setAdminLoginCookie();
    const phaseTitle = randomString();

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
          ideaTitle: randomString(),
          ideaContent: randomString(),
          phaseIds: [phase.body.data.id],
        }).then((idea) => {
          const email = randomEmail();
          const password = randomString();
          cy.apiSignup(randomString(), randomString(), email, password).then(
            (user) => {
              userId = user.body.data.id;
              cy.apiDislikeIdea(email, password, idea.body.data.id);
            }
          );
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
      });
  });

  beforeEach(() => {
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

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  afterEach(() => {
    cy.apiRemoveReportBuilder(reportId);
  });

  it('handles Reactions By Time widget correctly', function () {
    cy.get('#e2e-draggable-reactions-by-time-widget').dragAndDrop(
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

    // Confirms that button displays and functions correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    cy.visit(`projects/${projectSlug}`);
    cy.get('.recharts-surface:first').trigger('mouseover');

    cy.contains('New Widget Title').should('exist');
    cy.contains('Dislikes : 1').should('exist');
  });

  it('deletes Reactions By Time widget correctly', function () {
    cy.get('#e2e-draggable-reactions-by-time-widget').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');
    // Wait for reportLayout.attributes.craftjs_json update.
    //
    // The delete happens so quickly after save, that at the time
    // `onNodesChange` is called, reportLayout.attributes.craftjs_json
    // still has the initial value before save (empty).
    // After the delete, the actual state is also empty.
    // And so, the `saved` state is not properly updated.
    // Also, see posts_by_time_widget.cy.ts and comments_by_time_widget.cy.ts
    cy.wait('@getReportLayout');
    cy.wait(500);

    cy.get('#e2e-draggable-reactions-by-time-widget').should('exist');
    cy.get('#e2e-draggable-reactions-by-time-widget')
      .parent()
      .click({ force: true });

    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveReportLayout');

    cy.visit(`projects/${projectSlug}`);
    cy.get('#e2e-reactions-by-time-widget').should('not.exist');
  });
});
