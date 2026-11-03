import { randomEmail, randomString } from '../../support/commands';

// Long enough to force the dropdown layout and to show the search input.
const OPTION_COUNT = 30;
const SEARCH_TERM = 'Option 27';

describe('Native survey select question with many options', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  let userId = '';
  let projectId = '';
  let projectSlug = '';
  let questionKey = '';

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
    });

    cy.createProjectWithNativeSurveyPhase().then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;

      cy.apiCreateSurveyQuestions(
        result.phaseId,
        ['page', 'select'],
        undefined,
        OPTION_COUNT
      ).then((response) => {
        questionKey = response.body.data[1].attributes.key;
      });
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveIdeas(projectId).then(() => cy.apiRemoveProject(projectId));
    cy.apiRemoveUser(userId);
  });

  it('lets a respondent type to find an option and submit it', () => {
    cy.visit(`/projects/${projectSlug}/surveys/new`);

    // The question was created without `dropdown_layout`, so this also covers
    // long option lists being forced out of the inline radio layout.
    cy.get(`[id="${questionKey}"]`).should('have.attr', 'role', 'combobox');
    cy.get('input[type="radio"]').should('not.exist');

    cy.get(`[id="${questionKey}"]`).type(SEARCH_TERM);

    cy.get('[role="option"]')
      .should('have.length', 1)
      .and('contain.text', SEARCH_TERM);

    cy.get(`[id="${questionKey}"]`).type('{enter}');

    cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
    cy.dataCy('e2e-submit-form').click();

    cy.wait('@submitSurvey').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.dataCy('e2e-after-submission').should('exist');
  });
});
