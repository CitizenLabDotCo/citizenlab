import { ICustomFieldResponse } from '../../../../app/api/custom_fields/types';
import { randomString, randomEmail } from '../../../support/commands';
import moment = require('moment');

describe('Survey question widget', () => {
  let projectId: string;
  let surveyPhaseId: string;
  let surveyIncluded: any;
  let surveyFields: ICustomFieldResponse[];

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

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
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
          'linear_scale',
          'multiselect_image',
        ]);
      })
      .then((response) => {
        surveyIncluded = response.body.included;
        surveyFields = response.body.data;

        users.forEach(({ firstName, lastName, email, password, gender }, i) => {
          let jwt: any;

          cy.apiSignup(firstName, lastName, email, password)
            .then((response) => {
              jwt = response._jwt;
              userIds.push(response.body.data.id);

              cy.apiUpdateUserCustomFields(
                email,
                password,
                {
                  gender,
                },
                jwt
              );
            })
            .then(() => {
              cy.apiCreateSurveyResponse(
                email,
                password,
                projectId,
                {
                  [surveyFields[1].attributes.key]:
                    surveyIncluded[0].attributes.key,
                  [surveyFields[2].attributes.key]: [
                    surveyIncluded[2].attributes.key,
                    surveyIncluded[3].attributes.key,
                  ],
                  [surveyFields[3].attributes.key]: i > 1 ? 3 : 2,
                  [surveyFields[4].attributes.key]: [
                    surveyIncluded[4].attributes.key,
                  ],
                },
                jwt
              );
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

  describe('global report builder', () => {
    it('works for multiselect question', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder().then((report) => {
        const reportId = report.body.data.id;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.get('#e2e-report-builder-project-filter-box select').select(
          projectId
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyFields[2].id);

        // Check if values are correct
        cy.get('.e2e-survey-question-ungrouped-bars')
          .first()
          .contains('50% (4 choices)');

        cy.get('svg.e2e-progress-bar').should('have.length', 3);
        cy.get('svg.e2e-progress-bar')
          .first()
          .should('have.attr', 'width', '50%');
        cy.get('svg.e2e-progress-bar')
          .eq(1)
          .should('have.attr', 'width', '50%');
        cy.get('svg.e2e-progress-bar').eq(2).should('have.attr', 'width', '0%');

        // Group by gender and confirm correctness
        cy.get('#e2e-group-mode-select').select('user_field');
        cy.get('#e2e-user-field-select').select('Gender');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 5);
          cy.get('svg.e2e-progress-bar')
            .first()
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(1)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(2)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(3)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(4)
            .should('have.attr', 'width', '0%');
        };

        ensureCorrectGrouping();

        // Save
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.get('#e2e-content-builder-topbar-save').click();
        cy.wait('@saveReportLayout');

        // Reload page and check if values are still correct
        cy.reload();
        ensureCorrectGrouping();

        cy.apiRemoveReportBuilder(reportId);
      });
    });
  });

  describe('phase report builder', () => {
    //   it('works for select question', () => {
    //     // TODO
    //   });

    it('works for linear scale', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.get('#e2e-report-builder-project-filter-box select').select(
          projectId
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyFields[3].id);

        // Check if values are correct
        cy.get('.e2e-survey-question-ungrouped-bars')
          .first()
          .contains('50% (2 choices)');

        cy.get('svg.e2e-progress-bar').should('have.length', 6);
        cy.get('svg.e2e-progress-bar')
          .eq(2)
          .should('have.attr', 'width', '50%');
        cy.get('svg.e2e-progress-bar')
          .eq(3)
          .should('have.attr', 'width', '50%');
        cy.get('svg.e2e-progress-bar').eq(4).should('have.attr', 'width', '0%');

        // Group by gender and confirm correctness
        cy.get('#e2e-group-mode-select').select('user_field');
        cy.get('#e2e-user-field-select').select('Gender');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 8);
          cy.get('svg.e2e-progress-bar')
            .eq(2)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(3)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(4)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(5)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(6)
            .should('have.attr', 'width', '0%');
        };

        ensureCorrectGrouping();

        // Save
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.get('#e2e-content-builder-topbar-save').click();
        cy.wait('@saveReportLayout');

        // Reload page and check if values are still correct
        cy.reload();
        ensureCorrectGrouping();

        cy.apiRemoveReportBuilder(reportId);
      });
    });

    it.only('works for image question', () => {
      cy.setAdminLoginCookie();
      cy.apiCreateReportBuilder().then((report) => {
        const reportId = report.body.data.id;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.get('#e2e-report-builder-project-filter-box select').select(
          projectId
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyFields[4].id);

        cy.wait(15000);

        // Check if values are correct
        // cy.get('.e2e-survey-question-ungrouped-bars')
        //   .first()
        //   .contains('50% (4 choices)');

        // cy.get('svg.e2e-progress-bar').should('have.length', 3);
        // cy.get('svg.e2e-progress-bar')
        //   .first()
        //   .should('have.attr', 'width', '50%');
        // cy.get('svg.e2e-progress-bar')
        //   .eq(1)
        //   .should('have.attr', 'width', '50%');
        // cy.get('svg.e2e-progress-bar').eq(2).should('have.attr', 'width', '0%');

        // Group by gender and confirm correctness
        // cy.get('#e2e-group-mode-select').select('user_field');
        // cy.get('#e2e-user-field-select').select('Gender');

        // const ensureCorrectGrouping = () => {
        //   cy.get('svg.e2e-progress-bar').should('have.length', 5);
        //   cy.get('svg.e2e-progress-bar')
        //     .first()
        //     .should('have.attr', 'width', '25%');
        //   cy.get('svg.e2e-progress-bar')
        //     .eq(1)
        //     .should('have.attr', 'width', '25%');
        //   cy.get('svg.e2e-progress-bar')
        //     .eq(2)
        //     .should('have.attr', 'width', '25%');
        //   cy.get('svg.e2e-progress-bar')
        //     .eq(3)
        //     .should('have.attr', 'width', '25%');
        //   cy.get('svg.e2e-progress-bar')
        //     .eq(4)
        //     .should('have.attr', 'width', '0%');
        // };

        // ensureCorrectGrouping();

        // // Save
        // cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        //   'saveReportLayout'
        // );
        // cy.get('#e2e-content-builder-topbar-save').click();
        // cy.wait('@saveReportLayout');

        // // Reload page and check if values are still correct
        // cy.reload();
        // ensureCorrectGrouping();

        cy.apiRemoveReportBuilder(reportId);
      });
    });

    //   it('is initialized with correct phase', () => {

    //   });
  });
});
