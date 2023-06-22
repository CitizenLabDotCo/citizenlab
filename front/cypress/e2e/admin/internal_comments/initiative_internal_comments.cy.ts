import { randomString } from '../../../support/commands';

describe('Initiative internal comments', () => {
  const initiativeTitle = randomString();
  const initiativeContent = randomString();
  let initiativeId: string;

  before(() => {
    cy.apiCreateInitiative({ initiativeTitle, initiativeContent }).then(
      (initiaitve) => {
        initiativeId = initiaitve.body.data.id;
        cy.wait(2000);
      }
    );
  });

  it('allows users to post, edit and delete an internal comment on an initiative', () => {
    const internalComment = randomString();
    const editedComment = randomString();

    cy.setAdminLoginCookie();
    cy.visit(`admin/initiatives/${initiativeId}`);
    cy.acceptCookies();

    // Create comment and check that comment is created
    cy.get('[data-cy="e2e-tab-internal"]').click();
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type(internalComment);
    cy.get('.e2e-submit-parentcomment').click();
    cy.get('.e2e-parentcomment').contains(internalComment);

    // Edit comment and check that comment is edited
    cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
    cy.get('[data-testid="moreOptionsButton"]').first().click();
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit');
    cy.get('.e2e-more-actions-list button').eq(1).click();
    cy.get('#e2e-internal-comment-edit-textarea')
      .click()
      .clear()
      .type(editedComment);
    cy.get('#e2e-save-internal-comment-edit-button').click();
    cy.get('.e2e-parentcomment').contains(editedComment);

    // Delete comment and check that comment is deleted
    cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
    cy.get('[data-testid="moreOptionsButton"]').first().click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Delete');
    cy.get('.e2e-more-actions-list button').eq(0).click();
    cy.get('#e2e-confirm-deletion').should('exist');
    cy.get('#e2e-confirm-deletion').click();
    cy.get('.e2e-parentcomment').should('not.exist');
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId);
  });
});
