import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder multiple choice choose multiple component', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
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
      });

    cy.setAdminLoginCookie();
  });

  it('adds multiselect multiple choice field and is displayed when filling survey', () => {
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-multiple-choice"]').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1 question 2', { force: true });
    cy.get('form').submit();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains('Question title 2').should('exist');
    cy.contains('Option 1 question 2').should('exist');
    cy.get('#e2e-multiselect-control').should('exist');
  });

  it('allows using an other option that is mandatory when other is selected when entering data in the form/survey', () => {
    const otherText = 'Other';
    const questionTitle = randomString();
    const otherAnswer = 'Walking';
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.acceptCookies();
    cy.get('[data-cy="e2e-multiple-choice"]').click();
    cy.get('[data-cy="e2e-other-option-toggle"]')
      .find('input')
      .click({ force: true });
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('#e2e-option-input-0').type('Car', { force: true });
    cy.get('#e2e-option-input-1').should('exist');
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');
    cy.contains(otherText).click({ force: true });
    cy.contains('Survey').should('exist');
    cy.get('#e2e-single-select-control').should('exist');

    // Try going to the next page without filling in the survey
    cy.get('[data-cy="e2e-next-page"]').click();

    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message').should('exist');
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );

    cy.get('[id^="properties"]')
      .should(($element) => {
        const id = $element.attr('id');
        expect(id).to.include(questionTitle);
        expect(Cypress._.endsWith(id, '_other')).to.be.true;
      })
      .type(otherAnswer, { force: true });

    // Go to the next page
    cy.get('[data-cy="e2e-next-page"]').click();

    // Save survey response
    cy.get('[data-cy="e2e-submit-form"]').should('exist');
    cy.get('[data-cy="e2e-submit-form"]').click();

    // Check that we show a success message
    cy.get('[data-cy="e2e-survey-success-message"]').should('exist');
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check that the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
