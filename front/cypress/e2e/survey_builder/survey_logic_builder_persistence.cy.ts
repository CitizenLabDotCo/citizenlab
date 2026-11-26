import {
  createSurveyWithFields,
  CustomFieldsResponse,
  endPage,
  fieldByTitle,
  firstPage,
  page,
  ratingQuestion,
  textQuestion,
  visitSurveyBuilder,
} from './logicUtils';

describe('Survey logic in the builder', () => {
  let projectId: string | undefined;

  beforeEach(() => {
    projectId = undefined;
    cy.setAdminLoginCookie();
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('offers a Logic tab for a rating question but drops its rules on save without an error (current behaviour, B1)', () => {
    const ratingTitle = 'Rate the service';
    const ratingRow = () =>
      cy.contains('[data-cy="e2e-field-row"]', ratingTitle);

    createSurveyWithFields(
      [
        firstPage('p1'),
        ratingQuestion({ title: ratingTitle }),
        page('p2', 'Page two'),
        textQuestion('Question on page two'),
        endPage('end'),
      ],
      (id) => {
        projectId = id;
      }
    ).then((survey) => {
      visitSurveyBuilder(survey);
      cy.dataCy('e2e-field-row').should('have.length', 5);

      ratingRow().click();
      cy.dataCy('e2e-form-builder-logic-tab').click();
      cy.dataCy('e2e-add-rule-button').first().click();
      cy.dataCy('e2e-rule-input-select').find('select').select('Ending');

      ratingRow()
        .find('[data-cy="e2e-field-rule-display"]')
        .contains('Ending')
        .should('exist');

      cy.intercept(
        'PATCH',
        `/web_api/v1/phases/${survey.phaseId}/custom_fields/update_all`
      ).as('updateAll');
      cy.get('form').submit();

      cy.wait('@updateAll').then((interception) => {
        const sentFields: {
          title_multiloc: Record<string, string>;
          logic: { rules?: unknown[] };
        }[] = interception.request.body.custom_fields;
        const sentRating = sentFields.find(
          (field) => field.title_multiloc.en === ratingTitle
        );
        expect(sentRating?.logic.rules).to.have.length(1);

        const savedFields: CustomFieldsResponse = interception.response?.body;
        expect(
          fieldByTitle(savedFields, ratingTitle).attributes.logic
        ).to.deep.equal({});
      });
      cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

      ratingRow()
        .find('[data-cy="e2e-field-rule-display"]')
        .should('not.exist');

      cy.reload();
      cy.dataCy('e2e-field-row').should('have.length', 5);
      ratingRow().click();
      cy.dataCy('e2e-form-builder-logic-tab').click();
      cy.dataCy('e2e-add-rule-button').should('exist');
      cy.dataCy('e2e-rule-input-select').should('not.exist');

      cy.apiGetSurveyFields(survey.phaseId).then((response) => {
        expect(
          fieldByTitle(response.body, ratingTitle).attributes.logic
        ).to.deep.equal({});
      });
    });
  });
});
