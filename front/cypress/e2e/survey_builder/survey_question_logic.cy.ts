import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Survey question logic', () => {
  const projectTitle = randomString();
  const phaseTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    cy.setAdminLoginCookie();
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
          projectId: projectId as string,
          title: phaseTitle,
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
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('allows setting logic for select question', () => {
    cy.setAdminLoginCookie();
    cy.visit(
      `/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`
    );
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 3);

    // Add a new page
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 4);

    // Add another page
    cy.wait(1000);
    cy.get('[data-cy="e2e-page"').click();
    cy.get('[data-cy="e2e-field-row"]').should('have.length', 5);

    // Save
    // TODO: this should not be necessary, but it is because of a bug
    // where we can't change survey logic until we save the survey
    // See https://www.notion.so/govocal/Cannot-add-survey-logic-sometimes-1929663b7b268020a8b4c9fb6912269a
    cy.get('form').submit();
    // Make sure we see "Survey successfully saved" message
    cy.get('[data-testid="feedbackSuccessMessage"]');

    // Open settings
    cy.get('[data-cy="e2e-field-row"]').eq(1).click();
    cy.get('[data-cy="e2e-form-builder-logic-tab"]').click();

    // Set first answer to go straight to ending
    cy.get('[data-cy="e2e-add-rule-button"]').first().click();
    cy.get('[data-cy="e2e-rule-input-select"]')
      .first()
      .find('select')
      .select('Ending');

    // Set no answer to go to page 3
    cy.get('[data-cy="e2e-add-rule-button"]').eq(2).click();
    cy.get('[data-cy="e2e-rule-input-select"]')
      .eq(1)
      .find('select')
      .select('Page 3');

    // Save again
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]');

    // Take survey and make sure it works as expected
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Select first option
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .first()
      .click();

    // Make sure submit button is shown
    cy.wait(1000);
    cy.get('[data-cy="e2e-submit-form"]');

    // Instead select option 2
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .eq(1)
      .click();

    // Go to next page
    cy.wait(1000);
    cy.get('[data-cy="e2e-next-page"]').click();

    // Make sure we're on page 2
    cy.get('[data-cy="e2e-page-number-2');

    // Go back, deselect option 2
    cy.wait(1000);
    cy.get('[data-cy="e2e-previous-page"]').click();
    cy.get('[data-cy="e2e-page-number-1');
    cy.wait(1000);
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .eq(1)
      .click();

    // Go to next page, make sure we're on page 3
    cy.wait(1000);
    cy.get('[data-cy="e2e-next-page"]').click();
    cy.get('[data-cy="e2e-page-number-3');
  });
});
