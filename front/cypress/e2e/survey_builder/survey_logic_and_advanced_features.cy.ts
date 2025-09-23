import { randomString } from '../../support/commands';

const waitForCustomFormFields = () => {
  cy.intercept('**/phases/**/custom_fields**').as('customFields');
  cy.wait('@customFields', { timeout: 10000 });
  cy.wait(1000);
};

describe('Survey Builder - Logic and Advanced Features', () => {
  const phaseTitle = randomString();
  let questionTitle = randomString();
  const answer = randomString();
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    questionTitle = randomString();

    cy.createProjectWithNativeSurveyPhase({ phaseTitle }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      phaseId = result.phaseId;
    });
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('creates survey with logic, saves survey and user can respond to survey and responses determine which page he sees based on set logic', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    // First page
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add second page
    cy.addItemToFormBuilder('#toolbox_page');

    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add third page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    // Add rule to go to survey end
    cy.dataCy('e2e-rule-input-select').get('select').select(4);
    // Add rule to go to page 3
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').get('select').eq(1).select(3);

    // Check to see that the rules are added to the field row
    cy.dataCy('e2e-field-rule-display')
      .contains(chooseOneOption1)
      .should('exist');
    cy.dataCy('e2e-field-rule-display')
      .contains(chooseOneOption2)
      .should('exist');
    cy.dataCy('e2e-field-rule-display').contains('Ending').should('exist');

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.contains(questionTitle).should('exist');

    // Selecting the first option results in a submit button
    cy.contains(chooseOneOption1).click({ force: true });
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();

    // Check to see that the user is on the submit page
    cy.dataCy('e2e-page-number-4').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');

    // Take the survey again
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#project-survey-button').find('button').click({ force: true });
    cy.contains(questionTitle).should('exist');

    // Select the second option and click next
    cy.contains(chooseOneOption2).click({ force: true });
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Check to see that the user is on the third page
    cy.contains(page3Title).should('exist');

    // Submit
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();
    cy.dataCy('e2e-page-number-4').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('creates survey with logic and the user can navigate back and forth without previous logic options changing the order of pages', () => {
    const firstLogicQnOption1 = randomString();
    const firstLogicQnOption2 = randomString();
    const secondLogicQnOption1 = randomString();
    const secondLogicQnOption2 = randomString();
    const page3QnTitle = randomString();
    const page4QnTitle = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const page4Title = randomString();
    const firstSingleChoiceTitle = 'firstSingleChoiceTitle';
    const secondSingleChoiceTitle = 'secondSingleChoiceTitle';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(firstSingleChoiceTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(firstLogicQnOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(firstLogicQnOption2, { force: true });

    // Add second page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(secondSingleChoiceTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(secondLogicQnOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(secondLogicQnOption2, { force: true });

    // Add third page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(page3QnTitle, { force: true });
    cy.get('#e2e-required-toggle').find('input').click({ force: true });

    // Add fourth page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page4Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(page4QnTitle, { force: true });

    // Save the survey and reload the page before adding logic (bug with adding logic)
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
    cy.reload();

    // Add logic to the first single choice question
    cy.contains(firstSingleChoiceTitle).should('exist');
    cy.contains(firstSingleChoiceTitle).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    // Add rule to go to page 4
    cy.dataCy('e2e-rule-input-select').get('select').select(4);
    // Add rule to go to page 2
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').get('select').eq(1).select(2);

    // Add logic to the second single choice question
    cy.contains(secondSingleChoiceTitle).should('exist');
    cy.contains(secondSingleChoiceTitle).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    // Add rule to go to survey end
    cy.dataCy('e2e-rule-input-select').get('select').select(5);
    // Add rule to go to page 3
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').get('select').eq(1).select(3);

    // Check to see that the rules are added to the field row
    cy.dataCy('e2e-field-rule-display')
      .contains(firstLogicQnOption1)
      .should('exist');
    cy.dataCy('e2e-field-rule-display').contains('Ending').should('exist');
    cy.dataCy('e2e-field-rule-display')
      .contains(firstLogicQnOption2)
      .should('exist');
    cy.dataCy('e2e-field-rule-display').contains('Ending').should('exist');

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    cy.wait(2000);
    cy.contains(questionTitle).should('exist');

    // Select the second option to go to page 2
    cy.contains('label', firstLogicQnOption2)
      .should('exist')
      .click({ force: true });
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.contains(page2Title).should('exist');

    // Selecting the first option turns the next button into a submit button
    cy.dataCy('e2e-next-page').should('exist');
    cy.dataCy('e2e-submit-form').should('not.exist');
    cy.contains('label', secondLogicQnOption1)
      .should('exist')
      .should('be.visible')
      .click({ force: true });
    cy.dataCy('e2e-next-page').should('not.exist');
    cy.dataCy('e2e-submit-form').should('exist');

    // Going back brings us to page 1
    cy.dataCy('e2e-previous-page').click();
    cy.contains(questionTitle).should('exist');

    cy.dataCy('e2e-page-number-1').should('exist');

    // Select the first option to go to page 4
    cy.contains(firstLogicQnOption1).click({ force: true });
    cy.wait(1000);
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.dataCy('e2e-page-number-4').should('exist');
    cy.contains(page4Title).should('exist');

    // Going back brings us to page 1
    cy.dataCy('e2e-previous-page').click();
    cy.dataCy('e2e-page-number-1').should('exist');
    cy.contains(questionTitle).should('exist');
    cy.wait(1000);

    // Go to page 4 again (the chosen option is remembered)
    cy.dataCy('e2e-next-page').click({ force: true });
    cy.dataCy('e2e-page-number-4').should('exist');
    cy.contains(page4Title).should('exist');

    // Submit
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();
    cy.dataCy('e2e-page-number-5').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('shows validation errors when current page or previous pages are referenced', () => {
    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Add second page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add multiple choice question to the second page
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add third page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Save the survey and reload the page before adding logic (bug with adding logic)
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
    cy.reload();

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').should('exist');

    // Does not allow selecting current and previous pages
    cy.dataCy('e2e-rule-input-select')
      .get('select')
      .contains('Page 1')
      .should('be.disabled');
    cy.dataCy('e2e-rule-input-select')
      .get('select')
      .contains(page2Title)
      .should('be.disabled');
    cy.dataCy('e2e-rule-input-select')
      .get('select')
      .contains(page3Title)
      .should('be.enabled');
    cy.dataCy('e2e-rule-input-select')
      .get('select')
      .contains('Ending')
      .should('be.enabled');

    cy.dataCy('e2e-rule-input-select').get('select').select(4);

    // Check to see that the rules are added to the field row
    cy.dataCy('e2e-field-rule-display')
      .contains(chooseOneOption1)
      .should('exist');
    cy.dataCy('e2e-field-rule-display').contains('Ending').should('exist');

    // Save the survey
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
  });

  it('creates survey with page logic and user fills in the survey based on that logic', () => {
    cy.intercept('POST', '**/ideas').as('saveSurvey');

    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const question4Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const page4Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, {
      force: true,
      delay: 0,
    });

    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
      delay: 0,
    });
    cy.get('#e2e-option-input-0')
      .type(chooseOneOption1, {
        force: true,
      })
      .should('have.value', chooseOneOption1);
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1')
      .type(chooseOneOption2, {
        force: true,
      })
      .should('have.value', chooseOneOption2);

    // Add second page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, {
      force: true,
      delay: 0,
    });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question2Title, {
      force: true,
      delay: 0,
    });

    // Add third page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, {
      force: true,
      delay: 0,
    });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question3Title, {
      force: true,
      delay: 0,
    });

    // Add fourth page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page4Title, {
      force: true,
      delay: 0,
    });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question4Title, {
      force: true,
      delay: 0,
    });

    // Save the survey and reload the page before adding logic (bug with adding logic)
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
    cy.reload();

    // Add page logic to page 2 to go to survey end
    cy.contains(page2Title).should('exist');
    cy.contains(page2Title).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    cy.dataCy('e2e-rule-input-select').get('select').select(5);

    // Save the survey
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    // First page
    cy.contains(questionTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(chooseOneOption1).should('exist');
    cy.contains(chooseOneOption1).click();

    // Check to see that we are on the second page
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.contains(page2Title).should('exist');

    // Submit
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();

    cy.wait('@saveSurvey').then((interception) => {
      const idea = interception.request.body.idea;

      // Extract the answer by filtering keys that match the question title,
      // since answers are stored as dynamic keys like `${title}_${randomId}`.
      const answerValues = Object.entries(idea)
        .filter(([key]) => key.startsWith(`${multipleChoiceChooseOneTitle}_`))
        .map(([, value]) => value);

      expect(answerValues[0]).to.include(chooseOneOption1);
    });

    cy.dataCy('e2e-page-number-5').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });

  it('creates survey with page logic and question logic where question logic takes precedence over page logic', () => {
    cy.intercept('POST', '**/ideas').as('saveSurvey');

    const chooseOneOption1 = randomString();
    const chooseOneOption2 = randomString();
    const question2Title = randomString();
    const question3Title = randomString();
    const question4Title = randomString();
    const page2Title = randomString();
    const page3Title = randomString();
    const page4Title = randomString();
    const multipleChoiceChooseOneTitle = 'multiplechoicechooseonefield';

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/survey-form`);
    cy.dataCy('e2e-edit-survey-form').click();
    waitForCustomFormFields();

    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(questionTitle, { force: true });

    // Add second page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page2Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question2Title, { force: true });

    // Add multiple choice question to the second page
    cy.addItemToFormBuilder('#toolbox_select');
    cy.get('#e2e-title-multiloc').type(multipleChoiceChooseOneTitle, {
      force: true,
    });
    cy.get('#e2e-option-input-0').type(chooseOneOption1, { force: true });
    cy.dataCy('e2e-add-answer').click();
    cy.get('#e2e-option-input-1').type(chooseOneOption2, { force: true });

    // Add third page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page3Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question3Title, { force: true });

    // Add fourth page
    cy.addItemToFormBuilder('#toolbox_page');
    cy.get('#e2e-field-group-title-multiloc').type(page4Title, { force: true });
    cy.addItemToFormBuilder('#toolbox_text');
    cy.get('#e2e-title-multiloc').type(question4Title, { force: true });

    // Save the survey and reload the page before adding logic (bug with adding logic)
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');
    cy.reload();

    // Add logic to the multiple choice question
    cy.contains(multipleChoiceChooseOneTitle).should('exist');
    cy.contains(multipleChoiceChooseOneTitle).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').first().click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    // Add rule to go to survey end
    cy.dataCy('e2e-rule-input-select').get('select').select(4);

    // Add page logic to page 2 to go to page 3
    cy.contains(page2Title).should('exist');
    cy.contains(page2Title).click();
    cy.dataCy('e2e-form-builder-logic-tab').click();
    cy.dataCy('e2e-add-rule-button').click();
    cy.dataCy('e2e-rule-input-select').should('exist');
    cy.dataCy('e2e-rule-input-select').get('select').select(3);

    // Save the survey
    cy.get('form').submit();

    // Try filling in the survey
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);

    // First page
    cy.contains(questionTitle).should('exist');

    // Go to page two and check to see that we are on the second page
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.contains(page2Title).should('exist');

    // Go through option 2 flow first and enter data
    cy.contains(chooseOneOption2).should('be.visible').click({ force: true });
    cy.dataCy('e2e-next-page').should('be.visible').click();
    cy.contains(page3Title).should('exist');
    cy.contains(question3Title).should('exist').click().type('question3');

    // Go back to page 2
    cy.dataCy('e2e-previous-page').click();

    // Select the first option and click next
    cy.contains(chooseOneOption1).click({ force: true });
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Check to see that we are on the fourth page and on the last page as indicated by the page logic
    cy.contains(page4Title).should('exist');
    cy.contains(question4Title).should('exist');

    // Submit and check that page 3 answer (not in final page path) is not sent to server
    cy.wait(1000);
    cy.dataCy('e2e-submit-form').should('be.visible').click();

    cy.wait('@saveSurvey').then((interception) => {
      const keys = Object.keys(interception.request.body.idea);
      keys.forEach((key) => {
        const value = interception.request.body.idea[key];
        expect(value).not.to.equal('question3');
      });
    });
    cy.dataCy('e2e-page-number-4').should('exist');
    cy.dataCy('e2e-after-submission').should('exist');
  });
});
