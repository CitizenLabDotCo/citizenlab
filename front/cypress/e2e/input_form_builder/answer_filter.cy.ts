import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Input form answer filter', () => {
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.setAdminLoginCookie();

    cy.apiCreateProject({ title: randomString() })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });
  });

  it('lets a public choice question be used as a filter', () => {
    const question = randomString();
    const option = randomString();
    const ideaWithAnswer = randomString();
    const ideaWithoutAnswer = randomString();

    // Only a choice question with public answers offers the filter
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(question, { force: true });
    cy.get('#e2e-option-input-0').type(option, { force: true });
    cy.get('#e2e-answer-filter-toggle').should('not.exist');
    cy.get('#e2e-public-answers-toggle').find('input').click({ force: true });
    cy.get('#e2e-answer-filter-toggle').find('input').click({ force: true });
    cy.get('#e2e-answer-filter-toggle').find('input').should('be.checked');

    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Participants can narrow the ideas down to one answer
    cy.apiGetSurveyFields(phaseId).then((response) => {
      const field = response.body.data.find(
        (field: any) => field.attributes.title_multiloc.en === question
      );
      const optionKey = response.body.included.find(
        (resource: any) =>
          resource.type === 'custom_field_option' &&
          resource.attributes.title_multiloc.en === option
      ).attributes.key;

      cy.apiCreateIdea({
        phaseId,
        ideaTitle: ideaWithAnswer,
        ideaContent: randomString(40),
        customFieldValues: { [field.attributes.key]: optionKey },
      });
      cy.apiCreateIdea({
        phaseId,
        ideaTitle: ideaWithoutAnswer,
        ideaContent: randomString(40),
      });
    });

    cy.visit(`projects/${projectSlug}`);
    cy.get('.e2e-idea-card').should('have.length', 2);
    cy.dataCy('e2e-answer-filter-box').contains(option).click();
    cy.get('.e2e-idea-card')
      .should('have.length', 1)
      .and('contain', ideaWithAnswer);
    cy.dataCy('e2e-answer-filter-box').contains(option).click();
    cy.get('.e2e-idea-card').should('have.length', 2);

    // The setting is stored
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();
    cy.dataCy('e2e-form-fields').contains(question).click();
    cy.get('#e2e-answer-filter-toggle').find('input').should('be.checked');

    // Making the answers private again drops the filter
    cy.get('#e2e-public-answers-toggle').find('input').click({ force: true });
    cy.get('#e2e-answer-filter-toggle').should('not.exist');
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Showing the answers again starts the filter off
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/form`);
    cy.dataCy('e2e-edit-input-form').click();
    cy.dataCy('e2e-form-fields').contains(question).click();
    cy.get('#e2e-public-answers-toggle').find('input').click({ force: true });
    cy.get('#e2e-answer-filter-toggle').find('input').should('not.be.checked');
  });
});
