import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder single choice field', () => {
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

  it('adds single select multiple choice field and is displayed when filling survey', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.dataCy('e2e-single-choice');
    cy.wait(2000);
    cy.dataCy('e2e-single-choice').click();
    cy.get('form').submit();
    cy.contains('Provide a question title').should('exist');
    cy.contains('Provide at least 1 answer').should('exist');
    cy.get('#e2e-title-multiloc').type('Question title', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1', { force: true });
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains('Question title').should('exist');
    cy.contains('Option 1').should('exist');
    cy.contains('Survey').should('exist');
    cy.get('#e2e-single-select-control').should('exist');
  });

  it('allows submitting when there is an other option that is not selected and is not filled out', () => {
    const questionTitle = randomString();
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.acceptCookies();
    cy.dataCy('e2e-single-choice');
    cy.wait(2000);
    cy.dataCy('e2e-single-choice').click();
    cy.dataCy('e2e-other-option-toggle').find('input').click({ force: true });
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('#e2e-option-input-0').type('Car', { force: true });
    cy.contains('Save').click();

    // Go to survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');

    // Save survey response
    cy.dataCy('e2e-submit-form').should('exist');
    cy.dataCy('e2e-submit-form').click();

    // Check that we're on final page and return to project
    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // Make sure we're back at the project
    cy.url().should('include', `projects/${projectSlug}`);
  });

  it('allows using an other option that is mandatory when other is selected when entering data in the form/survey', () => {
    const otherText = 'Other';
    const questionTitle = randomString();
    const otherAnswer = 'Walking';
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.acceptCookies();
    cy.dataCy('e2e-single-choice');
    cy.wait(2000);
    cy.dataCy('e2e-single-choice').click();
    cy.dataCy('e2e-other-option-toggle').find('input').click({ force: true });
    cy.get('#e2e-required-toggle').find('input').click({
      force: true,
    });
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });
    cy.get('#e2e-option-input-0').type('Car', { force: true });
    cy.contains('Save').click();

    // Go to survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');
    cy.wait(2000);
    cy.contains(otherText).click({ force: true });
    cy.contains('Survey').should('exist');
    cy.get('#e2e-single-select-control').should('exist');

    // Try submitting without entering data for required field
    cy.dataCy('e2e-submit-form').click();

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

    // Save survey response
    cy.dataCy('e2e-submit-form').should('exist');
    cy.dataCy('e2e-submit-form').click();

    // Check that we're on final page and return to project
    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // Make sure we're back at the project
    cy.url().should('include', `projects/${projectSlug}`);
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
