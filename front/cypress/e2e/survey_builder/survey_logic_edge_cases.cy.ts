import {
  adminRequest,
  createSurveyWithFields,
  endPage,
  fieldByTitle,
  firstPage,
  goToPreviousPage,
  optionByTitle,
  page,
  pickOption,
  selectQuestion,
  textQuestion,
  visitSurvey,
} from './logicUtils';

type SurveyResult = {
  customFieldId: string;
  totalResponseCount: number;
  questionResponseCount: number;
  hidden: boolean;
  logic?: {
    answer?: Record<
      string,
      { id?: string; nextPageNumber?: number; numQuestionsSkipped?: number }
    >;
  };
};

type SurveyResultsResponse = {
  data: { attributes: { results: SurveyResult[] } };
};

const PAGE_2_QUESTION = 'Question on page two';
const PAGE_3_QUESTION = 'Question on page three';

describe('Survey logic edge cases (respondent form)', () => {
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

  it('goes to the next page instead of the any-other-answer target for a select, while the results treat that page as skipped (currently existing bug, B2)', () => {
    const question = 'Where do you live?';
    const optionWithRule = 'City centre';
    const optionWithoutRule = 'Somewhere else';

    createSurveyWithFields(
      [
        firstPage('p1'),
        selectQuestion({
          title: question,
          options: [
            { tempId: 'opt-centre', title: optionWithRule },
            { tempId: 'opt-elsewhere', title: optionWithoutRule },
          ],
          rules: [
            { if: 'opt-centre', goto_page_id: 'p3' },
            { if: 'any_other_answer', goto_page_id: 'p3' },
          ],
        }),
        page('p2', 'Page two'),
        textQuestion(PAGE_2_QUESTION),
        page('p3', 'Page three'),
        textQuestion(PAGE_3_QUESTION),
        endPage('end'),
      ],
      (id) => {
        projectId = id;
      }
    ).then((survey) => {
      const page2Question = fieldByTitle(survey.fields, PAGE_2_QUESTION);
      const page3Question = fieldByTitle(survey.fields, PAGE_3_QUESTION);
      const selectField = fieldByTitle(survey.fields, question);
      const elsewhereOption = optionByTitle(survey.fields, optionWithoutRule);

      cy.intercept('POST', '**/phases/*/inputs').as('addIdea');
      cy.intercept('PATCH', '**/ideas/*').as('updateIdea');
      visitSurvey(survey);

      // The option's own rule works, so the logic did load
      pickOption(optionWithRule);
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@addIdea');
      cy.dataCy('e2e-page-number-3').should('exist');
      goToPreviousPage();
      cy.dataCy('e2e-page-number-1').should('exist');

      pickOption(optionWithoutRule);
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@updateIdea');
      cy.dataCy('e2e-page-number-2').should('exist');
      cy.contains(PAGE_2_QUESTION).should('exist');

      cy.get(`input#${page2Question.attributes.key}`).type('Seen anyway');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@updateIdea');
      cy.dataCy('e2e-page-number-3').should('exist');

      cy.clickInputFormPageButton('e2e-submit-form');
      cy.wait('@updateIdea').then((interception) => {
        const idea: Record<string, unknown> = interception.request.body.idea;
        expect(idea.publication_status).to.equal('published');
        expect(idea[page2Question.attributes.key]).to.equal('Seen anyway');
      });
      cy.dataCy('e2e-after-submission').should('exist');

      // The results apply the any-other-answer rule, so the answered page-two
      // question counts as not seen
      adminRequest<SurveyResultsResponse>({
        method: 'GET',
        url: `web_api/v1/phases/${survey.phaseId}/survey_results`,
      }).then((response) => {
        const results = response.body.data.attributes.results;
        const resultFor = (fieldId: string) => {
          const result = results.find((r) => r.customFieldId === fieldId);
          if (!result) throw new Error(`No result for field ${fieldId}`);
          return result;
        };

        expect(resultFor(page2Question.id).totalResponseCount).to.equal(0);
        expect(resultFor(page2Question.id).questionResponseCount).to.equal(0);
        expect(resultFor(page3Question.id).totalResponseCount).to.equal(1);

        const optionLogic = Object.values(
          resultFor(selectField.id).logic?.answer ?? {}
        ).find((answer) => answer.id === elsewhereOption.id);
        expect(optionLogic?.nextPageNumber).to.equal(3);
        expect(optionLogic?.numQuestionsSkipped).to.equal(1);
      });

      adminRequest<SurveyResultsResponse>({
        method: 'GET',
        url: `web_api/v1/phases/${survey.phaseId}/survey_results?filter_logic_ids[]=${elsewhereOption.id}`,
      }).then((response) => {
        const results = response.body.data.attributes.results;
        const page2Result = results.find(
          (r) => r.customFieldId === page2Question.id
        );
        const page3Result = results.find(
          (r) => r.customFieldId === page3Question.id
        );
        expect(page2Result?.hidden).to.equal(true);
        expect(page3Result?.hidden).to.equal(false);
      });
    });
  });

  it('leaves answers on a page that a changed answer now skips out of the request bodies and the stored response', () => {
    const sceneryQuestion = 'Describe the scenery';
    const remarksQuestion = 'Any final remarks?';
    let ideaId: string | undefined;

    createSurveyWithFields(
      [
        firstPage('p1'),
        selectQuestion({
          title: 'Which route do you take?',
          options: [
            { tempId: 'opt-scenic', title: 'Scenic route' },
            { tempId: 'opt-direct', title: 'Direct route' },
          ],
          rules: [{ if: 'opt-direct', goto_page_id: 'p3' }],
        }),
        page('p2', 'Page two'),
        textQuestion(sceneryQuestion),
        page('p3', 'Page three'),
        textQuestion(remarksQuestion),
        endPage('end'),
      ],
      (id) => {
        projectId = id;
      }
    ).then((survey) => {
      const sceneryKey = fieldByTitle(survey.fields, sceneryQuestion).attributes
        .key;
      const remarksKey = fieldByTitle(survey.fields, remarksQuestion).attributes
        .key;

      cy.intercept('POST', '**/phases/*/inputs').as('addIdea');
      cy.intercept('PATCH', '**/ideas/*').as('updateIdea');
      visitSurvey(survey);

      pickOption('Scenic route');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@addIdea').then((interception) => {
        ideaId = interception.response?.body.data.id;
      });
      cy.dataCy('e2e-page-number-2').should('exist');

      cy.get(`input#${sceneryKey}`).type('Lovely hills');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@updateIdea').then((interception) => {
        const idea: Record<string, unknown> = interception.request.body.idea;
        expect(idea[sceneryKey]).to.equal('Lovely hills');
      });
      cy.dataCy('e2e-page-number-3').should('exist');

      goToPreviousPage();
      cy.dataCy('e2e-page-number-2').should('exist');
      goToPreviousPage();
      cy.dataCy('e2e-page-number-1').should('exist');

      pickOption('Direct route');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@updateIdea').then((interception) => {
        const idea: Record<string, unknown> = interception.request.body.idea;
        expect(idea).not.to.have.property(sceneryKey);
      });
      cy.dataCy('e2e-page-number-3').should('exist');

      cy.get(`input#${remarksKey}`).type('Quick trip');
      cy.clickInputFormPageButton('e2e-submit-form');
      cy.wait('@updateIdea').then((interception) => {
        const idea: Record<string, unknown> = interception.request.body.idea;
        expect(idea.publication_status).to.equal('published');
        expect(idea[remarksKey]).to.equal('Quick trip');
        expect(idea).not.to.have.property(sceneryKey);
      });
      cy.dataCy('e2e-after-submission').should('exist');

      cy.then(() =>
        adminRequest<{ data: { attributes: Record<string, unknown> } }>({
          method: 'GET',
          url: `web_api/v1/ideas/${ideaId}`,
        })
      ).then((response) => {
        const attributes = response.body.data.attributes;
        expect(attributes[remarksKey]).to.equal('Quick trip');
        expect(attributes).not.to.have.property(sceneryKey);
      });
    });
  });
});
