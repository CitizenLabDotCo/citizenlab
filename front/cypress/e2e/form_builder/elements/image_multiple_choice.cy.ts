import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Form builder image multiple choice choose multiple component', () => {
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

  it('adds image multiple choice field and is displayed when filling survey', () => {
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.dataCy('e2e-image-choice');
    cy.wait(2000);
    cy.dataCy('e2e-image-choice').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1 question 2', { force: true });
    cy.get('form').submit();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains('Question title 2').should('exist');
    cy.contains('Option 1 question 2').should('exist');
  });

  it('allows using an other option that is mandatory when other is selected when entering data in the form/survey', () => {
    const questionTitle = randomString();
    const otherAnswer = 'Walking';
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
    cy.acceptCookies();
    cy.dataCy('e2e-image-choice');
    cy.wait(2000);
    cy.dataCy('e2e-image-choice').click();
    cy.dataCy('e2e-other-option-toggle').find('input').click({ force: true });
    cy.get('#e2e-title-multiloc').type(questionTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type('Car', { force: true });
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.contains(questionTitle).should('exist');
    cy.wait(2000);
    cy.get(`*[id^="${questionTitle}"]`).eq(1).click({
      force: true,
    });
    cy.contains('Survey').should('exist');
    cy.get(`*[id^="${questionTitle}"]`).should('exist');

    // Try submitting without entering data for required field
    cy.dataCy('e2e-submit-form').wait(1000).click();

    // verify that an error is shown and that we stay on the page
    cy.get('.e2e-error-message').should('exist');
    cy.url().should(
      'eq',
      `${
        Cypress.config().baseUrl
      }/en/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
    );

    cy.get(`*[id^="${questionTitle}"]`)
      .last()
      .should(($element) => {
        const id = $element.attr('id');
        expect(Cypress._.endsWith(id, '_other')).to.be.true;
      })
      .type(otherAnswer, { force: true, delay: 0 });

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
