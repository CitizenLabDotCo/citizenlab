import { ICustomFieldResponse } from '../../../app/api/custom_fields/types';
import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Survey template', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;
  let surveyFields: ICustomFieldResponse[];

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
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.apiCreateSurveyQuestions(phaseId, ['page', 'select', 'multiselect']);
      })
      .then((response) => {
        surveyFields = response.body.data;

        users.forEach(({ firstName, lastName, email, password, gender }) => {
          cy.apiSignup(firstName, lastName, email, password)
            .then((response) => {
              userIds.push(response.body.data.id);

              cy.apiUpdateUserCustomFields(email, password, {
                gender,
              });
            })
            .then(() => {
              cy.apiCreateSurveyResponse(email, password, projectId, {
                [surveyFields[1].attributes.key]: 'option_1',
                [surveyFields[2].attributes.key]: ['option_1', 'option_2'],
              });
            });
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);

    userIds.forEach((userId) => {
      cy.apiRemoveUser(userId);
    });
  });

  it('should create a survey template', () => {
    cy.setAdminLoginCookie();

    // Create report from template
    cy.visit(`/admin/reporting/report-builder`);
    cy.get('#e2e-create-report-button').click();

    cy.get('.e2e-create-report-modal-title-input').type(randomString());
    cy.get('#project-template-radio').click({ force: true });
    cy.get('#projectFilter').select(projectId);

    cy.get('button[data-testid="create-report-button"]').click();

    // Ensure we are in the editor
    cy.url().should('include', '/en/admin/reporting/report-builder/');
    cy.url().should('include', `editor?templateProjectId=${projectId}`);
    cy.get('.e2e-content-builder-frame').should('exist');

    // Ensure correct amount of questions (TODO)

    // Remove report
    cy.visit('/admin/reporting/report-builder');
    cy.get('#e2e-delete-report-button').click();

    // Ensure we're back to the empty state
    cy.get('#e2e-create-report-button').click();
  });
});
