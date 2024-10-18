import { randomString, randomEmail } from '../../../support/commands';
import moment = require('moment');

let projectId: string;
let projectSlug: string;
let ideationPhaseId: string;

let informationPhaseId: string;

const users = Array(4)
  .fill(0)
  .map((_, i) => ({
    firstName: randomString(),
    lastName: randomString(),
    email: randomEmail(),
    password: randomString(),
    gender: i % 2 ? 'male' : 'female',
  }));

const userIds: string[] = [];

// Temporarily skip intermitttent demographics widget test. Tracking fix with TAN-2811
describe.skip('Demographics widget', () => {
  before(() => {
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
          participationMethod: 'ideation',
        });
      })
      .then((phase) => {
        ideationPhaseId = phase.body.data.id;

        users.forEach((user) => {
          const { firstName, lastName, email, password, gender } = user;

          let jwt: any;

          cy.apiSignup(firstName, lastName, email, password)
            .then((response) => {
              jwt = response._jwt;
              userIds.push(response.body.data.id);

              return cy.apiUpdateUserCustomFields(
                email,
                password,
                {
                  gender,
                },
                jwt
              );
            })
            .then(() => {
              return cy.apiCreateIdea({
                projectId,
                ideaTitle: randomString(),
                ideaContent: randomString(),
                jwt,
              });
            });
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
        informationPhaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);

    userIds.forEach((userId) => {
      cy.apiRemoveUser(userId);
    });
  });

  it('works', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
      const reportId = report.body.data.id;
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

      cy.get('#e2e-draggable-demographics-widget').dragAndDrop(
        '#e2e-content-builder-frame',
        {
          position: 'inside',
        }
      );

      cy.wait(1000);

      // Initializes as gender widget
      cy.get('.e2e-demographics-widget').should('contain', 'Gender');

      // Set end date in the future
      cy.get('#e2e-end-date-input')
        .clear({ force: true })
        .type(moment().add(10, 'day').format('DD/MM/YYYY'), { force: true });

      cy.wait(2000);

      // Close settings
      cy.get('.e2eBuilderSettingsClose').click();

      // Make sure data is correct
      cy.get('text.recharts-text > tspan').first().contains('50%');
      cy.get('text.recharts-text > tspan').eq(1).contains('50%');

      // Save
      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.get('#e2e-content-builder-topbar-save').click();
      cy.wait('@saveReportLayout');

      // Go to phase, see if widget is there
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-phase-report').should('exist');

      // Make sure data is correct
      cy.get('#e2e-phase-report')
        .get('text.recharts-text > tspan')
        .first()
        .contains('50%');
      cy.get('#e2e-phase-report')
        .get('text.recharts-text > tspan')
        .eq(1)
        .contains('50%');
    });
  });
});
