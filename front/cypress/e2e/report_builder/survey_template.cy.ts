import {
  ICustomFields,
  ICustomFieldResponse,
} from '../../../app/api/custom_fields/types';
import { ICustomFieldOptionData } from '../../../app/api/custom_field_options/types';
import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');
import { base64 } from '../../fixtures/base64img';

describe('Survey template', () => {
  let projectId: string;
  const projectTitle = randomString();
  let phaseId: string;
  let surveyCustomFields: ICustomFields;

  let userId: string;

  before(() => {
    cy.apiRemoveAllReports();

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
        phaseId = phase.body.data.id;
        return cy.uploadSurveyImageQuestionImage(base64);
      })
      .then((questionImage) => {
        return cy.apiCreateSurveyQuestions(
          phaseId,
          [
            'page',
            'select',
            'multiselect',
            'linear_scale',
            'multiselect_image',
            'point',
          ],
          questionImage.body.data.id
        );
      })
      .then(() => {
        return cy.apiGetSurveyFields(phaseId);
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

        const getAnswerKeys = (field: ICustomFieldResponse) => {
          return field.relationships.options.data.map((option) => {
            const optionData = included.find((i) => i.id === option.id);
            return optionData?.attributes.key;
          });
        };

        const selectAnswerKeys = getAnswerKeys(selectField);
        const multiSelectAnswerKeys = getAnswerKeys(multiSelectField);
        const multiselectImageAnswerKeys = getAnswerKeys(multiselectImageField);

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
                [linearScaleField.attributes.key]: 2,
                [multiselectImageField.attributes.key]: [
                  multiselectImageAnswerKeys[0],
                ],
                [pointField.attributes.key]: {
                  type: 'Point',
                  coordinates: [4.349371842575076, 50.85428103529364],
                },
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
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Global report builder', () => {
    it('should create a survey template', () => {
      // Create report from template
      cy.visit(`/admin/reporting/report-builder`);
      cy.get('#e2e-create-report-button').click();

      cy.get('.e2e-create-report-modal-title-input').type(randomString());
      cy.get('#project-template-radio').click({ force: true });
      cy.selectReactSelectOption('#e2e-project-filter', projectTitle);

      cy.get('div[data-testid="create-report-button"] > button').click();

      // Ensure we are in the editor
      cy.url().should('include', '/en/admin/reporting/report-builder/');
      cy.url().should('include', `editor?templateProjectId=${projectId}`);
      cy.get('#e2e-content-builder-frame').should('exist');

      // Ensure correct amount of questions
      cy.get('.e2e-survey-question-widget-title').should('have.length', 5);
      cy.get('.e2e-survey-question-widget-title')
        .first()
        .contains('Question: select');
      cy.get('.e2e-survey-question-widget-title')
        .eq(1)
        .contains('Question: multiselect');
      cy.get('.e2e-survey-question-widget-title')
        .eq(2)
        .contains('Question: linear_scale');
      cy.get('.e2e-survey-question-widget-title')
        .eq(3)
        .contains('Question: multiselect_image');
      cy.get('.e2e-survey-question-widget-title')
        .eq(4)
        .contains('Question: point');

      // Ensure correct values
      cy.get('.e2e-survey-question-ungrouped-bars')
        .first()
        .contains('100% (1 choice)');
      cy.get('.e2e-survey-question-ungrouped-bars')
        .eq(1)
        .contains('100% (1 choice)');

      // Remove report
      cy.visit('/admin/reporting/report-builder');
      cy.get('#e2e-delete-report-button').click();

      // Ensure we're back to the empty state
      cy.get('#e2e-create-report-button').should('exist');
    });
  });

  describe('Phase report builder', () => {
    it('should create a survey template', () => {
      // Create report inside of phase
      cy.visit(`/en/admin/projects/${projectId}/phases/${phaseId}/report`);
      cy.get('#e2e-create-report-button').click();

      // Ensure correct phase selected by default
      cy.get('#e2e-phase-filter').should('have.value', phaseId);

      // Create report from template
      cy.get('div[data-testid="create-report-button"] > button').click();

      // Ensure we are in the editor
      cy.url().should('include', `/en/admin/reporting/report-builder/`);
      cy.url().should('include', `editor?templatePhaseId=${phaseId}`);
      cy.get('#e2e-content-builder-frame').should('exist');

      // Ensure correct amount of questions
      cy.get('.e2e-survey-question-widget-title').should('have.length', 5);
      cy.get('.e2e-survey-question-widget-title')
        .first()
        .contains('Question: select');
      cy.get('.e2e-survey-question-widget-title')
        .eq(1)
        .contains('Question: multiselect');
      cy.get('.e2e-survey-question-widget-title')
        .eq(2)
        .contains('Question: linear_scale');
      cy.get('.e2e-survey-question-widget-title')
        .eq(3)
        .contains('Question: multiselect_image');
      cy.get('.e2e-survey-question-widget-title')
        .eq(4)
        .contains('Question: point');

      // Ensure correct values
      cy.get('.e2e-survey-question-ungrouped-bars')
        .first()
        .contains('100% (1 choice)');
      cy.get('.e2e-survey-question-ungrouped-bars')
        .eq(1)
        .contains('100% (1 choice)');

      // Remove report
      cy.visit(`/en/admin/projects/${projectId}/phases/${phaseId}/report`);
      cy.get('#e2e-delete-report-button').click();

      // Ensure we're back to the empty state
      cy.get('#e2e-create-report-button').should('exist');
    });
  });
});
