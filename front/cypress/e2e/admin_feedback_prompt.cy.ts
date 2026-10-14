import { randomEmail, randomString } from '../support/commands';

describe('Admin feedback prompt', () => {
  const prompt = {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'feedback_prompt',
    attributes: { key: 'return_findability', status: 'shown' },
  };

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.intercept('POST', '**/web_api/v1/feedback_prompts/show_next', {
      body: { data: prompt },
    });
    cy.intercept(
      'PATCH',
      `**/web_api/v1/feedback_prompts/${prompt.id}/answer`,
      {
        body: {
          data: {
            ...prompt,
            attributes: { ...prompt.attributes, status: 'answered' },
          },
        },
      }
    ).as('answer');
    cy.intercept(
      'PATCH',
      `**/web_api/v1/feedback_prompts/${prompt.id}/dismiss`,
      {
        body: {
          data: {
            ...prompt,
            attributes: { ...prompt.attributes, status: 'dismissed' },
          },
        },
      }
    ).as('dismiss');
    cy.visit('/admin/projects', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'feedback_prompt_project_exit',
          JSON.stringify({
            projectId: '22222222-2222-4222-8222-222222222222',
            adminArea: '/:locale/admin/projects/:projectId/general',
          })
        );
      },
    });
    cy.get('[data-cy="feedback-prompt"]').should('be.visible');
  });

  it('saves on selection and keeps the answer when closed', () => {
    cy.get('[data-cy="feedback-score-6"]').click();
    cy.wait('@answer')
      .its('request.body')
      .should('deep.equal', {
        feedback_prompt: { score: 6 },
      });
    cy.get('[data-cy="feedback-score-6"]').should(
      'have.attr',
      'aria-pressed',
      'true'
    );
    cy.get('[data-cy="feedback-prompt"] textarea').should('be.visible');
    cy.get('[data-cy="feedback-prompt"] [data-cy="feedback-close"]').click();
    cy.get('[data-cy="feedback-prompt"]').should('not.exist');
    cy.get('@dismiss.all').should('have.length', 0);
  });

  it('dismisses after a save fails even if the card was already closed', () => {
    cy.intercept(
      'PATCH',
      `**/web_api/v1/feedback_prompts/${prompt.id}/answer`,
      {
        statusCode: 500,
        delay: 1500,
        body: { errors: {} },
      }
    ).as('failedAnswer');
    cy.get('[data-cy="feedback-score-6"]').click();
    cy.get('[data-cy="feedback-close"]').click();
    cy.get('[data-cy="feedback-prompt"]').should('not.exist');
    cy.wait('@failedAnswer');
    cy.wait('@dismiss').its('request.method').should('eq', 'PATCH');
  });

  it('adds a comment to the saved answer and shows thanks after Send', () => {
    cy.get('[data-cy="feedback-score-6"]').click();
    cy.wait('@answer');
    cy.get('[data-cy="feedback-prompt"] textarea').type(
      'The checklist helped.'
    );
    cy.get('[data-cy="feedback-send"]').click();
    cy.wait('@answer')
      .its('request.body')
      .should('deep.equal', {
        feedback_prompt: { score: 6, comment: 'The checklist helped.' },
      });
    cy.get('[data-cy="feedback-prompt"]').should(
      'contain.text',
      'Thank you for your feedback!'
    );
  });
});

describe('Admin feedback prompt with the real API', () => {
  const email = randomEmail();
  const password = randomString();
  let userId: string;
  let projectId: string;

  before(() => {
    cy.apiCreateAdmin('Feedback', 'Test', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.apiCreateProject({
      title: randomString(),
      publicationStatus: 'draft',
    }).then((response) => {
      projectId = response.body.data.id;
    });
  });

  after(() => {
    if (projectId) cy.apiRemoveProject(projectId);
    if (userId) cy.apiRemoveUser(userId);
  });

  it('shows setup feedback after first publication and updates the same response', () => {
    cy.setLoginCookie(email, password);
    cy.intercept('POST', '**/web_api/v1/feedback_prompts/show_next').as(
      'showNext'
    );
    cy.intercept('PATCH', '**/web_api/v1/feedback_prompts/*/answer').as(
      'answer'
    );
    cy.intercept('PATCH', `**/web_api/v1/projects/${projectId}`).as(
      'publishProject'
    );
    cy.visit(`/admin/projects/${projectId}?project_backoffice_redesign`);
    cy.get('#e2e-publish-dropdown-toggle').click();
    cy.get('#e2e-publish-now').click();
    cy.wait('@publishProject', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);
    cy.wait('@showNext', { timeout: 15000 }).then(({ request, response }) => {
      expect(request.body.project_id).to.eq(projectId);
      expect(response?.statusCode).to.eq(200);
      expect(response?.body.data.attributes.key).to.eq('project_setup_ease');
    });
    cy.get('[data-cy="feedback-prompt"]').should(
      'contain.text',
      'How easy was it to set up this project?'
    );
    cy.get('[data-cy="feedback-score-6"]').click();
    cy.wait('@answer').then(({ request, response }) => {
      expect(response?.statusCode).to.eq(200);
      const answerUrl = request.url;
      const responseId = response?.body.data.id;
      cy.get('[data-cy="feedback-prompt"] textarea').type(
        'The checklist helped.'
      );
      cy.get('[data-cy="feedback-send"]').click();
      cy.wait('@answer').then(
        ({ request: commentRequest, response: commentResponse }) => {
          expect(commentRequest.url).to.eq(answerUrl);
          expect(commentResponse?.statusCode).to.eq(200);
          expect(commentResponse?.body.data.id).to.eq(responseId);
        }
      );
    });
    cy.get('[data-cy="feedback-prompt"]').should(
      'contain.text',
      'Thank you for your feedback!'
    );
  });
});
