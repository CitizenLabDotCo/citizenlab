import {
  ICustomFieldResponse,
  ICustomFields,
} from '../../../app/api/custom_fields/types';
import { randomString, randomEmail } from '../../support/commands';
import { ICustomFieldOptionData } from '../../../app/api/custom_field_options/types';
import moment = require('moment');

describe('Broken report', () => {
  let projectId: string;
  let surveyPhaseId: string;
  let surveyCustomFields: ICustomFields;
  const projectTitle = randomString();

  let reportPhaseId: string;

  let userId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
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

        return cy.apiCreateSurveyQuestions(surveyPhaseId, [
          'page',
          'select',
          'multiselect',
        ]);
      })
      .then(() => {
        return cy.apiGetSurveyFields(surveyPhaseId);
      })
      .then((response) => {
        surveyCustomFields = response.body;

        const fields = surveyCustomFields.data;
        const included = (surveyCustomFields as any)
          .included as ICustomFieldOptionData[];

        const selectField = fields[1];
        const multiSelectField = fields[2];

        const getAnswerKeys = (field: ICustomFieldResponse) => {
          return field.relationships.options.data.map((option) => {
            const optionData = included.find((i) => i.id === option.id);
            return optionData?.attributes.key;
          });
        };

        const selectAnswerKeys = getAnswerKeys(selectField);
        const multiSelectAnswerKeys = getAnswerKeys(multiSelectField);

        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();
        const gender = 'female';

        cy.apiSignup(firstName, lastName, email, password)
          .then((response) => {
            userId = response.body.data.id;

            cy.apiUpdateUserCustomFields(email, password, { gender });
          })
          .then(() => {
            cy.apiCreateSurveyResponse({
              email,
              password,
              project_id: projectId,
              fields: {
                [selectField.attributes.key]: selectAnswerKeys[0],
                [multiSelectField.attributes.key]: [
                  multiSelectAnswerKeys[0],
                  multiSelectAnswerKeys[1],
                ],
              },
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
        reportPhaseId = phase.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('still works after deleting survey phase', () => {
    cy.setAdminLoginCookie();
    cy.apiCreateReportBuilder(reportPhaseId).then((report) => {
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
      cy.selectReactSelectOption(
        '#e2e-report-builder-project-filter-box',
        projectTitle
      );
      cy.get('#e2e-phase-filter').select(surveyPhaseId);
      cy.get('.e2e-question-select select')
        .first()
        .select(surveyCustomFields.data[1].id);

      // Save
      cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
        'saveReportLayout'
      );
      cy.get('#e2e-content-builder-topbar-save').click();
      cy.wait('@saveReportLayout');

      // Go to report tab, make sure this looks good
      cy.visit(`/admin/projects/${projectId}/phases/${reportPhaseId}/report`);
      cy.get('.e2e-survey-question-ungrouped-bars');

      // Now delete the survey phase
      cy.intercept('DELETE', `/web_api/v1/phases/${surveyPhaseId}`).as(
        'removePhase'
      );
      cy.apiRemovePhase(surveyPhaseId);
      // This phase deleting is insanely slow and for some reason the intercept doesn't work
      cy.wait(5000);

      // Make sure report tab still looks good
      cy.reload();
      cy.get('.e2e-survey-question-ungrouped-bars');

      // Make sure survey question widget is shown as broken in the editor
      cy.visit(`/admin/reporting/report-builder/${reportId}/editor`);
      cy.get('.e2e-survey-question-ungrouped-bars').should('not.exist');
      cy.get('.e2e-widget-missing-data').should('exist');

      cy.apiRemoveReportBuilder(reportId);
    });
  });
});
