import { updatePermission } from '../../support/permitted_by_utils';
import { setSurvey, setSurveyFields } from './utils';
import { randomString, randomEmail } from '../../support/commands';

const SCALE_VALUE = 3;
const TEXT_ANSWER = 'An open ended answer';

// A linear scale rather than a select, because reading a cleared value is
// where the scale, matrix, ranking and sentiment fields used to fall back to
// the answer they held when the page first appeared.
const deselectSurveyFields = [
  {
    input_type: 'page',
    logic: {},
    required: false,
    enabled: true,
    title_multiloc: {},
    key: 'page1',
    code: null,
    page_layout: 'default',
    page_button_label_multiloc: {},
    page_button_link: '',
    include_in_printed_form: true,
    description_multiloc: {},
  },
  {
    input_type: 'linear_scale',
    logic: {},
    required: false,
    enabled: true,
    title_multiloc: { en: 'How satisfied are you?' },
    description_multiloc: {},
    maximum: 5,
    linear_scale_label_1_multiloc: { en: 'Not at all' },
    linear_scale_label_5_multiloc: { en: 'Very' },
  },
  {
    input_type: 'page',
    logic: {},
    required: false,
    enabled: true,
    title_multiloc: { en: '' },
    page_layout: 'default',
    page_button_label_multiloc: {},
    page_button_link: '',
    include_in_printed_form: true,
    description_multiloc: {},
  },
  {
    input_type: 'text',
    logic: {},
    required: false,
    enabled: true,
    title_multiloc: { en: 'Anything else?' },
    description_multiloc: {},
  },
  {
    input_type: 'page',
    logic: {},
    required: false,
    enabled: true,
    title_multiloc: { en: 'Thank you for sharing your input!' },
    key: 'form_end',
    code: null,
    page_layout: 'default',
    page_button_label_multiloc: {},
    page_button_link: '',
    include_in_printed_form: false,
    description_multiloc: {},
  },
];

// The next/submit buttons stay disabled until the page's last question has
// been scrolled into view, so wait for the enabled state instead of
// force-clicking — a force-click on a disabled button silently does nothing.
const clickPageButton = (dataCy: 'e2e-next-page' | 'e2e-submit-form') => {
  cy.get('[data-question-id]').last().scrollIntoView();
  cy.dataCy(dataCy).should('be.visible').should('not.have.class', 'disabled');
  cy.dataCy(dataCy).click();
};

const scaleOption = () => cy.get(`#linear-scale-option-${SCALE_VALUE}`);

const expectScaleChecked = (checked: boolean) =>
  scaleOption().should('have.attr', 'aria-checked', String(checked));

describe('Native survey data collection', () => {
  describe('permitted_by = everyone', () => {
    let projectId = '';
    let phaseId = '';
    let projectSlug = '';
    let question1key = '';
    let question2key = '';
    let question3key = '';
    let question1Option1Key = '';
    let question2Option1Key = '';

    before(() => {
      cy.createProjectWithNativeSurveyPhase().then((result) => {
        projectId = result.projectId;
        phaseId = result.phaseId;
        projectSlug = result.projectSlug;

        return updatePermission({
          phaseId,
          permitted_by: 'everyone',
          user_fields_in_form: false,
        }).then(() => {
          return setSurvey(cy, phaseId).then((response) => {
            const data = response.body.data;
            const question1 = data[1];
            const question2 = data[3];
            const question3 = data[5];

            question1key = question1.attributes.key;
            question2key = question2.attributes.key;
            question3key = question3.attributes.key;

            const included = response.body.included;
            question1Option1Key = included[1].attributes.key;
            question2Option1Key = included[3].attributes.key;
          });
        });
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    describe('as a visitor', () => {
      it('saves all survey data', () => {
        cy.visit(`/projects/${projectSlug}`);

        // Click take survey button
        cy.get('.e2e-idea-button')
          .first()
          .find('button')
          .click({ force: true });

        // Confirm we're in the survey now
        cy.location('pathname').should(
          'eq',
          `/en/projects/${projectSlug}/surveys/new`
        );

        // Answer first question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.dataCy('e2e-next-page').click();

        // Answer second question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.dataCy('e2e-next-page').click();

        // Answer third question
        cy.get(`input#${question3key}`).type('This is an open ended answer');

        // Submit survey
        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
        cy.dataCy('e2e-submit-form').click();

        // Make sure request body contains custom field value
        cy.wait('@submitSurvey').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
          expect(ideaPayload[question3key]).to.eq(
            'This is an open ended answer'
          );
        });

        // Now we should be on last page
        cy.dataCy('e2e-after-submission').should('exist');
      });
    });

    describe('as a logged in user', () => {
      before(() => {
        const email = randomEmail();
        const password = randomString();

        cy.apiSignup(randomString(), randomString(), email, password).then(
          () => {
            cy.setLoginCookie(email, password);
          }
        );
      });

      it('saves all survey data', () => {
        cy.visit(`/projects/${projectSlug}`);

        // Click take survey button
        cy.get('.e2e-idea-button')
          .first()
          .find('button')
          .click({ force: true });

        // Confirm we're in the survey now
        cy.location('pathname').should(
          'eq',
          `/en/projects/${projectSlug}/surveys/new`
        );

        // Answer first question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.wait(1000);
        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitPage1');
        cy.dataCy('e2e-next-page').click();
        cy.wait('@submitPage1').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
        });

        // Answer second question and go to next page
        cy.wait(1000);
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.wait(1000);
        cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitPage2');
        cy.dataCy('e2e-next-page').click();
        cy.wait('@submitPage2').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
        });

        // Answer third question
        cy.get(`input#${question3key}`).type('This is an open ended answer');

        // Submit survey
        cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitSurvey');
        cy.dataCy('e2e-submit-form').click();

        // Make sure request body contains custom field value
        cy.wait('@submitSurvey').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
          expect(ideaPayload[question3key]).to.eq(
            'This is an open ended answer'
          );
        });

        // Now we should be on last page
        cy.dataCy('e2e-after-submission').should('exist');
      });
    });
  });

  describe('deselecting an answer', () => {
    let projectId = '';
    let projectSlug = '';
    let scaleKey = '';
    let textKey = '';

    before(() => {
      cy.createProjectWithNativeSurveyPhase().then((result) => {
        projectId = result.projectId;
        projectSlug = result.projectSlug;

        return updatePermission({
          phaseId: result.phaseId,
          permitted_by: 'everyone',
          user_fields_in_form: false,
        }).then(() =>
          setSurveyFields(cy, result.phaseId, deselectSurveyFields).then(
            (response) => {
              scaleKey = response.body.data[1].attributes.key;
              textKey = response.body.data[3].attributes.key;
            }
          )
        );
      });
    });

    after(() => {
      cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    });

    const goToPageTwoAndBack = () => {
      clickPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-2').should('exist');
      cy.dataCy('e2e-previous-page').click();
      cy.dataCy('e2e-page-number-1').should('exist');
    };

    describe('as a visitor', () => {
      it('keeps the answer cleared and leaves it out of the submission', () => {
        cy.visit(`/projects/${projectSlug}/surveys/new`);

        // A round trip is what makes the form carry the answer through a
        // remount, so do one while it is set and one after clearing it.
        scaleOption().click();
        goToPageTwoAndBack();
        expectScaleChecked(true);

        scaleOption().click();
        expectScaleChecked(false);
        goToPageTwoAndBack();
        expectScaleChecked(false);

        clickPageButton('e2e-next-page');
        cy.get(`input#${textKey}`).type(TEXT_ANSWER);

        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
        clickPageButton('e2e-submit-form');

        cy.wait('@submitSurvey').then(({ request }) => {
          expect(request.body.idea).not.to.have.property(scaleKey);
          expect(request.body.idea[textKey]).to.eq(TEXT_ANSWER);
        });

        cy.dataCy('e2e-after-submission').should('exist');
      });
    });

    describe('as a logged in user', () => {
      const email = randomEmail();
      const password = randomString();

      before(() => {
        cy.apiSignup(randomString(), randomString(), email, password);
      });

      // Test isolation clears cookies between tests, so the cookie has to be
      // set per test rather than once in `before`.
      beforeEach(() => {
        cy.setLoginCookie(email, password);
      });

      it('clears the answer the draft already holds', () => {
        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('createDraft');
        cy.intercept('PATCH', '/web_api/v1/ideas/**').as('updateDraft');

        cy.visit(`/projects/${projectSlug}/surveys/new`);

        scaleOption().click();
        clickPageButton('e2e-next-page');

        // The answer reaches the draft first, so the final payload dropping it
        // is what clears it rather than it never having been stored.
        cy.wait('@createDraft').then(({ request }) => {
          expect(request.body.idea[scaleKey]).to.eq(SCALE_VALUE);
        });

        cy.dataCy('e2e-previous-page').click();
        cy.dataCy('e2e-page-number-1').should('exist');
        expectScaleChecked(true);

        scaleOption().click();
        expectScaleChecked(false);

        clickPageButton('e2e-next-page');
        cy.wait('@updateDraft');

        cy.get(`input#${textKey}`).type(TEXT_ANSWER);
        clickPageButton('e2e-submit-form');

        // A key missing from the payload tells the back end to clear the
        // stored value (CustomFieldParamsService#mark_custom_field_values_to_clear!).
        cy.wait('@updateDraft').then(({ request }) => {
          expect(request.body.idea).not.to.have.property(scaleKey);
          expect(request.body.idea[textKey]).to.eq(TEXT_ANSWER);
        });

        cy.dataCy('e2e-after-submission').should('exist');
      });
    });
  });
});
