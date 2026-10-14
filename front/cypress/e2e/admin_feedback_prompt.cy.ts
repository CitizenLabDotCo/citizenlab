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
      `**/web_api/v1/feedback_prompts/${prompt.id}/dismiss`
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
