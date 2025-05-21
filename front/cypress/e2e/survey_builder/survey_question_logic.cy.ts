import { createSurveyProject } from './utils';
import { v4 as uuidv4 } from 'uuid';

describe('Survey question logic', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    createSurveyProject(cy).then((res: any) => {
      projectId = res.projectId;
      projectSlug = res.projectSlug;
      phaseId = res.phaseId;
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('allows setting logic for select question', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`);
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

describe('Bug: ambiguity around missing values in survey logic', () => {
  let projectId: string | undefined;
  let projectSlug: string | undefined;
  let phaseId: string | undefined;

  before(() => {
    createSurveyProject(cy).then((res: any) => {
      projectId = res.projectId;
      projectSlug = res.projectSlug;
      phaseId = res.phaseId;

      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;
          const body = {
            custom_fields: [
              {
                id: 'd99d4aaf-0b15-4b49-b9dc-58be06c6656c',
                input_type: 'page',
                logic: {},
                required: false,
                enabled: true,
                title_multiloc: {},
                key: 'page1',
                code: null,
                page_layout: 'default',
                description_multiloc: {},
              },
              {
                id: 'e774c58b-6738-43ea-a977-6703c6b6fc58',
                input_type: 'select',
                logic: {
                  rules: [
                    {
                      if: 'dc68d260-730e-4fd7-994e-3cea20709608',
                      goto_page_id: '7e39d151-59c5-4a78-9b88-30cabbd200ca',
                    },
                    {
                      if: '77a32dd4-3eb7-4e91-9983-8a224d797f86',
                      goto_page_id: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
                    },
                    {
                      if: 'no_answer',
                      goto_page_id: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
                    },
                  ],
                },
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Your question',
                  'fr-BE': 'Votre question',
                  'nl-BE': 'Jouw vraag',
                  'nl-NL': 'Jouw vraag',
                },
                key: 'your_question_cf8',
                code: null,
                description_multiloc: {},
                options: [
                  {
                    id: 'dc68d260-730e-4fd7-994e-3cea20709608',
                    title_multiloc: {
                      en: 'Option 1',
                      'fr-BE': 'Option 1',
                      'nl-BE': 'Optie 1',
                      'nl-NL': 'Optie 1',
                    },
                    other: false,
                  },
                  {
                    id: '77a32dd4-3eb7-4e91-9983-8a224d797f86',
                    title_multiloc: {
                      en: 'Option 2',
                      'fr-BE': 'Option 2',
                      'nl-BE': 'Optie 2',
                      'nl-NL': 'Optie 2',
                    },
                    other: false,
                  },
                ],
                maximum_select_count: null,
                minimum_select_count: null,
                random_option_ordering: false,
                dropdown_layout: false,
              },
              {
                id: '7e39d151-59c5-4a78-9b88-30cabbd200ca',
                input_type: 'page',
                logic: {},
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Page 2',
                  'fr-BE': '',
                  'nl-BE': '',
                  'nl-NL': '',
                },
                key: null,
                code: null,
                page_layout: 'default',
                description_multiloc: {},
              },
              {
                id: 'ea9a7e74-87c5-444f-9518-7587b5e1bda7',
                input_type: 'select',
                logic: {
                  rules: [
                    {
                      if: 'no_answer',
                      goto_page_id: 'c5e6be59-54dd-4a24-851a-ee8dad15ac5a',
                    },
                    {
                      if: '1b09aea8-6943-409c-9581-83f6b51a3d47',
                      goto_page_id: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
                    },
                    {
                      if: 'any_other_answer',
                      goto_page_id: '47e3750c-29ef-4d00-ac12-33f6ee58960b',
                    },
                  ],
                },
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Another single choice',
                  'fr-BE': 'Another single choice',
                  'nl-BE': 'Another single choice',
                  'nl-NL': 'Another single choiceAnother single choice',
                },
                key: 'another_single_choice_nfi',
                code: null,
                description_multiloc: {},
                options: [
                  {
                    id: '1b09aea8-6943-409c-9581-83f6b51a3d47',
                    title_multiloc: {
                      en: 'Option 1',
                      'fr-BE': 'Option 1',
                      'nl-BE': 'Option 1',
                      'nl-NL': 'Option 1',
                    },
                    other: false,
                  },
                  {
                    id: '529897f6-e7fb-4c84-b99b-cca70967149b',
                    title_multiloc: {
                      en: 'Option 2',
                      'fr-BE': 'Option 2',
                      'nl-BE': 'Option 2',
                      'nl-NL': 'Option 2',
                    },
                    other: false,
                  },
                ],
                maximum_select_count: null,
                minimum_select_count: null,
                random_option_ordering: false,
                dropdown_layout: false,
              },
              {
                id: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
                input_type: 'page',
                logic: {},
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Page 3',
                  'fr-BE': '',
                  'nl-BE': '',
                  'nl-NL': '',
                },
                key: null,
                code: null,
                page_layout: 'default',
                description_multiloc: {},
              },
              {
                id: 'c5e6be59-54dd-4a24-851a-ee8dad15ac5a',
                input_type: 'page',
                logic: {},
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Page 4',
                  'fr-BE': '',
                  'nl-BE': '',
                  'nl-NL': '',
                },
                key: null,
                code: null,
                page_layout: 'default',
                description_multiloc: {},
              },
              {
                id: '47e3750c-29ef-4d00-ac12-33f6ee58960b',
                input_type: 'page',
                logic: {},
                required: false,
                enabled: true,
                title_multiloc: {
                  en: 'Thank you for sharing your input!',
                  'fr-BE': 'Merci pour votre participation !',
                  'nl-BE': 'Bedankt voor het delen van je invoer!',
                  'nl-NL': 'Bedankt voor het delen van je invoer!',
                },
                key: 'form_end',
                code: null,
                page_layout: 'default',
                description_multiloc: {
                  en: 'Your input has been successfully submitted.',
                  'fr-BE': 'Votre contribution a été soumise avec succès.',
                  'nl-BE': 'Je invoer is succesvol ingediend.',
                  'nl-NL': 'Je invoer is succesvol ingediend.',
                },
              },
            ],
          };

          return cy.request({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminJwt}`,
            },
            method: 'PATCH',
            url: `web_api/v1/admin/phases/${phaseId}/custom_fields/update_all`,
            body,
          });
        });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('navigates through the survey correctly (question skipped)', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Go to next page
    cy.wait(1000);
    cy.get('[data-cy="e2e-next-page"]').click();

    // Expect to be on page 3
    cy.get('[data-cy="e2e-page-number-3');
  });

  it('navigates through the survey correctly (option 1)', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`);
    cy.acceptCookies();

    // Select first option
    cy.get('#e2e-single-select-control')
      .find('[data-testid="radio-container"]')
      .first()
      .click();

    // Go to next page
    cy.wait(1000);
    cy.get('[data-cy="e2e-next-page"]').click();

    // Expect to be on page 3
    cy.get('[data-cy="e2e-page-number-3');
  });
});
