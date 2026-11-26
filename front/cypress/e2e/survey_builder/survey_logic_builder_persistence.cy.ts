import {
  adminRequest,
  createSurveyWithFields,
  CustomFieldsResponse,
  endPage,
  fieldByTitle,
  firstPage,
  linearScaleQuestion,
  optionByTitle,
  page,
  ratingQuestion,
  selectQuestion,
  textQuestion,
  visitSurveyBuilder,
} from './logicUtils';

const getSurveyFields = (phaseId: string, query = '') =>
  adminRequest<CustomFieldsResponse>({
    method: 'GET',
    url: `web_api/v1/phases/${phaseId}/custom_fields${query}`,
  });

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

    createSurveyWithFields([
      firstPage('p1'),
      ratingQuestion({ title: ratingTitle }),
      page('p2', 'Page two'),
      textQuestion('Question on page two'),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;

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

      getSurveyFields(survey.phaseId).then((response) => {
        expect(
          fieldByTitle(response.body, ratingTitle).attributes.logic
        ).to.deep.equal({});
      });
    });
  });

  it('keeps select and page logic when a form is copied, but empties the condition of linear scale rules (current behaviour)', () => {
    const selectTitle = 'Copied select';
    const scaleTitle = 'Copied scale';
    const jumpOption = 'Jump to page three';

    createSurveyWithFields([
      firstPage('p1'),
      selectQuestion({
        title: selectTitle,
        options: [
          { tempId: 'opt-copy-jump', title: jumpOption },
          { tempId: 'opt-copy-stay', title: 'Stay' },
        ],
        rules: [{ if: 'opt-copy-jump', goto_page_id: 'p3' }],
      }),
      linearScaleQuestion({
        title: scaleTitle,
        rules: [{ if: 3, goto_page_id: 'p3' }],
      }),
      page('p2', 'Page two', 'end'),
      textQuestion('Question on page two'),
      page('p3', 'Page three'),
      textQuestion('Question on page three'),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      const originalPage3 = fieldByTitle(survey.fields, 'Page three');

      getSurveyFields(survey.phaseId).then((response) => {
        expect(
          fieldByTitle(response.body, scaleTitle).attributes.logic.rules
        ).to.deep.equal([{ if: 3, goto_page_id: originalPage3.id }]);
      });

      // The builder loads this when opened with ?copy_from=<phase id>
      getSurveyFields(survey.phaseId, '?copy=true').then((response) => {
        const copy = response.body;
        const copiedPage3 = fieldByTitle(copy, 'Page three');
        const copiedEndPage = fieldByTitle(
          copy,
          'Thank you for sharing your input!'
        );
        const copiedJumpOption = optionByTitle(copy, jumpOption);

        expect(copiedPage3.id).not.to.equal(originalPage3.id);

        expect(
          fieldByTitle(copy, selectTitle).attributes.logic.rules
        ).to.deep.equal([
          {
            if: copiedJumpOption.attributes.temp_id,
            goto_page_id: copiedPage3.id,
          },
        ]);
        expect(copiedJumpOption.attributes.temp_id).to.match(/^TEMP-ID-/);

        expect(
          fieldByTitle(copy, 'Page two').attributes.logic.next_page_id
        ).to.equal(copiedEndPage.id);

        expect(
          fieldByTitle(copy, scaleTitle).attributes.logic.rules
        ).to.deep.equal([{ if: null, goto_page_id: copiedPage3.id }]);
      });
    });
  });
});
