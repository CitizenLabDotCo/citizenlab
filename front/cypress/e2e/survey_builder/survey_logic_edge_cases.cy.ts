import {
  adminRequest,
  createSurveyWithFields,
  endPage,
  fieldByTitle,
  firstPage,
  goToPreviousPage,
  linearScaleQuestion,
  LogicSurvey,
  optionByTitle,
  page,
  pickOption,
  selectQuestion,
  textQuestion,
  visitSurvey,
  visitSurveyBuilder,
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
const PAGE_4_QUESTION = 'Question on page four';

const expectNextButton = () => {
  cy.dataCy('e2e-next-page').should('exist');
  cy.dataCy('e2e-submit-form').should('not.exist');
};

const expectSubmitButton = () => {
  cy.dataCy('e2e-submit-form').should('exist');
  cy.dataCy('e2e-next-page').should('not.exist');
};

const expectConflictBadgeOnFirstPage = (survey: LogicSurvey) => {
  visitSurveyBuilder(survey);
  cy.dataCy('e2e-field-row')
    .first()
    .contains('Conflicting logic')
    .should('exist');
};

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

  it('goes to the next page instead of the any-other-answer target for a select, while the results treat that page as skipped (current behaviour)', () => {
    const question = 'Where do you live?';
    const optionWithRule = 'City centre';
    const optionWithoutRule = 'Somewhere else';

    createSurveyWithFields([
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
    ]).then((survey) => {
      projectId = survey.projectId;
      const page2Question = fieldByTitle(survey.fields, PAGE_2_QUESTION);
      const page3Question = fieldByTitle(survey.fields, PAGE_3_QUESTION);
      const selectField = fieldByTitle(survey.fields, question);
      const elsewhereOption = optionByTitle(survey.fields, optionWithoutRule);

      cy.intercept('PATCH', '**/ideas/*').as('updateIdea');
      visitSurvey(survey);

      // The option's own rule works, so the logic did load
      pickOption(optionWithRule);
      cy.clickInputFormPageButton('e2e-next-page');
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

  it('ignores the page default and goes to the next page when a question on the page has rules but none match (current behaviour)', () => {
    const stopOption = 'Yes, stop here';
    const continueOption = 'No, continue';

    createSurveyWithFields([
      firstPage('p1', 'p3'),
      selectQuestion({
        title: 'Do you want to stop here?',
        options: [
          { tempId: 'opt-stop', title: stopOption },
          { tempId: 'opt-continue', title: continueOption },
        ],
        rules: [{ if: 'opt-stop', goto_page_id: 'end' }],
      }),
      page('p2', 'Page two'),
      textQuestion(PAGE_2_QUESTION),
      page('p3', 'Page three'),
      textQuestion(PAGE_3_QUESTION),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      visitSurvey(survey);

      pickOption(stopOption);
      expectSubmitButton();

      pickOption(continueOption);
      expectNextButton();
      cy.clickInputFormPageButton('e2e-next-page');

      // The page default would have been page three
      cy.dataCy('e2e-page-number-2').should('exist');
      cy.contains(PAGE_2_QUESTION).should('exist');

      expectConflictBadgeOnFirstPage(survey);
    });
  });

  it('follows the last question with a matching rule on a page, not the furthest target (current behaviour)', () => {
    const firstJump = 'First: go to page four';
    const secondJump = 'Second: go to page three';
    const secondNoJump = 'Second: no jump';

    createSurveyWithFields([
      firstPage('p1'),
      selectQuestion({
        title: 'First question',
        options: [
          { tempId: 'opt-first-jump', title: firstJump },
          { tempId: 'opt-first-stay', title: 'First: no jump' },
        ],
        rules: [{ if: 'opt-first-jump', goto_page_id: 'p4' }],
      }),
      selectQuestion({
        title: 'Second question',
        options: [
          { tempId: 'opt-second-jump', title: secondJump },
          { tempId: 'opt-second-stay', title: secondNoJump },
        ],
        rules: [{ if: 'opt-second-jump', goto_page_id: 'p3' }],
      }),
      page('p2', 'Page two'),
      textQuestion(PAGE_2_QUESTION),
      page('p3', 'Page three'),
      textQuestion(PAGE_3_QUESTION),
      page('p4', 'Page four'),
      textQuestion(PAGE_4_QUESTION),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      visitSurvey(survey);

      pickOption(firstJump);
      pickOption(secondJump);
      cy.clickInputFormPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-3').should('exist');
      cy.contains(PAGE_3_QUESTION).should('exist');

      goToPreviousPage();
      cy.dataCy('e2e-page-number-1').should('exist');
      pickOption(secondNoJump);
      cy.clickInputFormPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-4').should('exist');
      cy.contains(PAGE_4_QUESTION).should('exist');

      // The builder warning says the furthest page is shown
      expectConflictBadgeOnFirstPage(survey);
    });
  });

  it('turns Next into Submit while a linear scale value that jumps to the end is selected', () => {
    createSurveyWithFields([
      firstPage('p1'),
      linearScaleQuestion({
        title: 'How likely are you to recommend us?',
        rules: [{ if: 5, goto_page_id: 'end' }],
      }),
      page('p2', 'Page two'),
      textQuestion(PAGE_2_QUESTION),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      visitSurvey(survey);

      expectNextButton();
      cy.get('#linear-scale-option-5').click();
      expectSubmitButton();
      cy.get('#linear-scale-option-2').click();
      expectNextButton();
      cy.get('#linear-scale-option-5').click();
      expectSubmitButton();

      cy.clickInputFormPageButton('e2e-submit-form');
      cy.dataCy('e2e-page-number-3').should('exist');
      cy.dataCy('e2e-after-submission').should('exist');
    });
  });

  it('follows the any-other-answer rule of a linear scale, and Back returns to the page the respondent came from', () => {
    createSurveyWithFields([
      firstPage('p1'),
      linearScaleQuestion({
        title: 'How satisfied are you?',
        rules: [
          { if: 5, goto_page_id: 'end' },
          { if: 'any_other_answer', goto_page_id: 'p3' },
        ],
      }),
      page('p2', 'Page two'),
      textQuestion(PAGE_2_QUESTION),
      page('p3', 'Page three'),
      textQuestion(PAGE_3_QUESTION),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      visitSurvey(survey);

      cy.get('#linear-scale-option-2').click();
      expectNextButton();
      cy.clickInputFormPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-3').should('exist');
      cy.contains(PAGE_3_QUESTION).should('exist');

      // Not the sequential previous page (page two)
      goToPreviousPage();
      cy.dataCy('e2e-page-number-1').should('exist');
      cy.get('#linear-scale-option-2').should(
        'have.attr',
        'aria-checked',
        'true'
      );
    });
  });

  it('follows the no-answer rule of an optional select only while it is unanswered', () => {
    createSurveyWithFields([
      firstPage('p1'),
      selectQuestion({
        title: 'Do you have a pet?',
        options: [
          { tempId: 'opt-dog', title: 'Yes, a dog' },
          { tempId: 'opt-cat', title: 'Yes, a cat' },
        ],
        rules: [{ if: 'no_answer', goto_page_id: 'p3' }],
      }),
      page('p2', 'Page two'),
      textQuestion(PAGE_2_QUESTION),
      page('p3', 'Page three'),
      textQuestion(PAGE_3_QUESTION),
      endPage('end'),
    ]).then((survey) => {
      projectId = survey.projectId;
      visitSurvey(survey);

      cy.clickInputFormPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-3').should('exist');

      goToPreviousPage();
      cy.dataCy('e2e-page-number-1').should('exist');
      pickOption('Yes, a dog');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.dataCy('e2e-page-number-2').should('exist');
      cy.contains(PAGE_2_QUESTION).should('exist');
    });
  });

  it('leaves answers on a page that a changed answer now skips out of the saved request bodies', () => {
    const sceneryQuestion = 'Describe the scenery';
    const remarksQuestion = 'Any final remarks?';

    createSurveyWithFields([
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
    ]).then((survey) => {
      projectId = survey.projectId;
      const sceneryKey = fieldByTitle(survey.fields, sceneryQuestion).attributes
        .key;
      const remarksKey = fieldByTitle(survey.fields, remarksQuestion).attributes
        .key;

      cy.intercept('POST', '**/phases/*/inputs').as('addIdea');
      cy.intercept('PATCH', '**/ideas/*').as('updateIdea');
      visitSurvey(survey);

      pickOption('Scenic route');
      cy.clickInputFormPageButton('e2e-next-page');
      cy.wait('@addIdea');
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
    });
  });
});
