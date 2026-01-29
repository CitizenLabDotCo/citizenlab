import {
  ICustomFields,
  ICustomFieldResponse,
} from '../../../../app/api/custom_fields/types';
import { ICustomFieldOptionData } from '../../../../app/api/custom_field_options/types';
import { randomString, randomEmail } from '../../../support/commands';
import moment = require('moment');
import { base64 } from '../../../fixtures/base64img';

let projectId: string;
const projectTitle = randomString();
let projectSlug: string;
let surveyPhaseId: string;
let surveyCustomFields: ICustomFields;

let informationPhaseId: string;

let currentReportId: string | undefined;

const locations = [
  [4.349371842575076, 50.85428103529364],
  [4.369558682598269, 50.85155093085792],
  [4.328887676753199, 50.81779337536646],
  [4.409667095102465, 50.81558358138426],
];

const users = Array(4)
  .fill(0)
  .map((_, i) => ({
    firstName: randomString(),
    lastName: randomString(),
    email: randomEmail(),
    password: randomString(),
    gender: i % 2 ? 'male' : 'female',
    location: locations[i],
  }));

const userIds: string[] = [];

describe('Survey question widget', () => {
  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
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
        return cy.uploadSurveyImageQuestionImage(base64);
      })
      .then((questionImage) => {
        return cy.apiCreateSurveyQuestions(
          surveyPhaseId,
          [
            'page',
            'select',
            'multiselect',
            'linear_scale',
            'multiselect_image',
            'point',
            'select',
          ],
          questionImage.body.data.id
        );
      })
      .then((response) => {
        return cy.apiGetSurveyFields(surveyPhaseId);
      })
      .then((response) => {
        surveyCustomFields = response.body;

        const fields = surveyCustomFields.data;
        const included = (surveyCustomFields as any)
          .included as ICustomFieldOptionData[];

        const selectField = fields[1];
        const multiSelectField = fields[2];
        const linearScaleField = fields[3];
        const multiselectImageField = fields[4];
        const pointField = fields[5];
        const select2Field = fields[6];

        const getAnswerKeys = (field: ICustomFieldResponse) => {
          return field.relationships.options.data.map((option) => {
            const optionData = included.find((i) => i.id === option.id);
            return optionData?.attributes.key;
          });
        };

        const selectAnswerKeys = getAnswerKeys(selectField);
        const multiSelectAnswerKeys = getAnswerKeys(multiSelectField);
        const multiselectImageAnswerKeys = getAnswerKeys(multiselectImageField);
        const select2AnswerKeys = getAnswerKeys(select2Field);

        users.forEach(
          ({ firstName, lastName, email, password, gender, location }, i) => {
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
                  {
                    email,
                    password,
                    project_id: projectId,
                    fields: {
                      [selectField.attributes.key]: selectAnswerKeys[0],
                      [multiSelectField.attributes.key]: [
                        multiSelectAnswerKeys[0],
                        multiSelectAnswerKeys[1],
                      ],
                      [linearScaleField.attributes.key]: i > 1 ? 3 : 2,
                      [multiselectImageField.attributes.key]: [
                        multiselectImageAnswerKeys[0],
                      ],
                      [pointField.attributes.key]: {
                        type: 'Point',
                        coordinates: location,
                      },
                      [select2Field.attributes.key]:
                        select2AnswerKeys[i % 2 ? 0 : 1],
                    },
                  },
                  jwt
                );
              });
          }
        );
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
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder().then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[2].id);

        // Check if values are correct
        cy.get('.e2e-survey-question-ungrouped-bars')
          .first()
          .contains('100% (4 choices)');

        cy.get('svg.e2e-progress-bar').should('have.length', 2);
        cy.get('svg.e2e-progress-bar')
          .first()
          .should('have.attr', 'width', '100%');
        cy.get('svg.e2e-progress-bar')
          .eq(1)
          .should('have.attr', 'width', '100%');

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
    // https://www.notion.so/citizenlab/Add-more-e2e-tests-47e6e8567e8b4ba2b60ed81834c32456
    //   it('works for select question', () => {
    //     // TODO
    //   });

    it('works for linear scale', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[3].id);

        // Check if values are correct
        cy.get('.e2e-survey-question-ungrouped-bars').first().contains('50%');

        cy.get('svg.e2e-progress-bar').should('have.length', 5);
        cy.get('svg.e2e-progress-bar')
          .eq(1)
          .should('have.attr', 'height', '50%');
        cy.get('svg.e2e-progress-bar')
          .eq(2)
          .should('have.attr', 'height', '50%');
        cy.get('svg.e2e-progress-bar')
          .eq(3)
          .should('have.attr', 'height', '0%');

        // Group by gender and confirm correctness
        cy.get('#e2e-group-mode-select').select('user_field');
        cy.get('#e2e-user-field-select').select('Gender');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 8);
          cy.get('svg.e2e-progress-bar')
            .eq(1)
            .should('have.attr', 'height', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(2)
            .should('have.attr', 'height', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(3)
            .should('have.attr', 'height', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(4)
            .should('have.attr', 'height', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(5)
            .should('have.attr', 'height', '0%');
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
      });
    });

    it('works for image question', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[4].id);

        // Check if values are correct
        cy.get('.e2e-survey-question-ungrouped-bars')
          .first()
          .contains('100% (4 choices)');

        cy.get('svg.e2e-progress-bar').should('have.length', 2);
        cy.get('svg.e2e-progress-bar')
          .first()
          .should('have.attr', 'width', '100%');
        cy.get('svg.e2e-progress-bar').eq(1).should('have.attr', 'width', '0%');

        // Group by gender and confirm correctness
        cy.get('#e2e-group-mode-select').select('user_field');
        cy.get('#e2e-user-field-select').select('Gender');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 4);
          cy.get('svg.e2e-progress-bar')
            .first()
            .should('have.attr', 'width', '50%');
          cy.get('svg.e2e-progress-bar')
            .eq(1)
            .should('have.attr', 'width', '50%');
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

    it('works for point question', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[5].id);

        // Expect map to render
        cy.get('div.esri-view-root').contains('Responses');

        // Save
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.get('#e2e-content-builder-topbar-save').click();
        cy.wait('@saveReportLayout');

        // Check if it's visible in the frontend
        cy.visit(`/projects/${projectSlug}`);
        cy.get('div.esri-view-root').contains('Responses');
      });
    });

    it('allows slicing multiselect by linear scale', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[2].id);

        // Group by linear scale
        cy.get('#e2e-group-mode-select').select('survey_question');
        cy.get('.e2e-question-select select')
          .eq(1)
          .select('3. Question: linear_scale');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 5);
          cy.get('svg.e2e-progress-bar')
            .first()
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(1)
            .should('have.attr', 'width', '25%');
          cy.get('svg.e2e-progress-bar')
            .eq(4)
            .should('have.attr', 'width', '0%');

          // Check colors
          cy.get('svg.e2e-progress-bar > rect')
            .first()
            .should('have.attr', 'fill', '#4D85C6');
          cy.get('svg.e2e-progress-bar > rect')
            .eq(1)
            .should('have.attr', 'fill', '#EE7041');
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
      });
    });

    it('has correct color scheme', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[6].id);

        cy.get('#e2e-group-mode-select').select('user_field');
        cy.get('#e2e-user-field-select').select('Gender');

        const ensureCorrectGrouping = () => {
          cy.get('svg.e2e-progress-bar').should('have.length', 3);
          cy.get('svg.e2e-progress-bar')
            .first()
            .should('have.attr', 'width', '50%');
          cy.get('svg.e2e-progress-bar > rect')
            .first()
            .should('have.attr', 'fill', '#2F478A');

          cy.get('svg.e2e-progress-bar')
            .eq(1)
            .should('have.attr', 'width', '50%');
          cy.get('svg.e2e-progress-bar > rect')
            .eq(1)
            .should('have.attr', 'fill', '#4D85C6');
        };

        // Save
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );
        cy.get('#e2e-content-builder-topbar-save').click();
        cy.wait('@saveReportLayout');

        // Reload page and check if values are still correct
        cy.reload();
        ensureCorrectGrouping();
      });
    });

    it.only('allows sorting by original order or count', () => {
      cy.setAdminLoginCookie();
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }

      cy.apiCreateReportBuilder(informationPhaseId).then((report) => {
        const reportId = report.body.data.id;
        currentReportId = reportId;

        cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);

        cy.get('#e2e-draggable-survey-question-result-widget').dragAndDrop(
          '#e2e-content-builder-frame',
          {
            position: 'inside',
          }
        );

        cy.wait(1000);

        // Select project, phase and question (multiselect)
        cy.selectReactSelectOption(
          '#e2e-report-builder-project-filter-box',
          projectTitle
        );
        cy.get('#e2e-phase-filter').select(surveyPhaseId);
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[2].id);

        // Verify sort dropdown is visible for multiselect question
        cy.dataCy('sort-select').should('be.visible');

        // Default should be 'count'
        cy.dataCy('sort-select').should('have.value', 'count');

        // Change to original order
        cy.dataCy('sort-select').select('original');
        cy.dataCy('sort-select').should('have.value', 'original');

        // Verify sort dropdown is not visible for linear_scale question
        cy.get('.e2e-question-select select')
          .first()
          .select(surveyCustomFields.data[3].id);
        cy.dataCy('sort-select').should('not.exist');
      });
    });

    it('removes last report', () => {
      if (currentReportId) {
        cy.apiRemoveReportBuilder(currentReportId);
        currentReportId = undefined;
      }
    });

    // https://www.notion.so/citizenlab/Add-more-e2e-tests-47e6e8567e8b4ba2b60ed81834c32456
    //   it('is initialized with correct phase', () => {

    //   });
  });
});
