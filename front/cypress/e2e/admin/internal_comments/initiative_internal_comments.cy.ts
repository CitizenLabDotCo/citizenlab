import { randomString } from '../../../support/commands';

describe('Initiative internal comments', () => {
  const initiativeTitle1 = randomString();
  const initiativeContent1 = randomString();
  const initiativeTitle2 = randomString();
  const initiativeContent2 = randomString();
  let initiativeId1: string;
  let initiativeId2: string;

  before(() => {
    cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;
      cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'PATCH',
        url: `web_api/v1/app_configuration`,
        body: {
          settings: {
            internal_commenting: {
              enabled: true,
              allowed: true,
            },
          },
        },
      });
    });

    cy.apiCreateInitiative({
      initiativeTitle: initiativeTitle1,
      initiativeContent: initiativeContent1,
    }).then((initiaitve) => {
      initiativeId1 = initiaitve.body.data.id;
    });
    cy.apiCreateInitiative({
      initiativeTitle: initiativeTitle2,
      initiativeContent: initiativeContent2,
    }).then((initiaitve) => {
      initiativeId2 = initiaitve.body.data.id;
    });
  });

  it('allows users to post, edit and delete an internal comment on an initiative', () => {
    const internalComment = randomString();
    const editedComment = randomString();

    cy.setAdminLoginCookie();
    cy.visit(`admin/initiatives/${initiativeId1}`);
    cy.acceptCookies();

    // Create comment and check that comment is created
    cy.get('[data-cy="e2e-comments-tab-internal"]').click();
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type(internalComment);
    cy.get('.e2e-submit-parentcomment').click();
    cy.get('.e2e-parentcomment').contains(internalComment);

    // Edit comment and check that comment is edited
    cy.get('[data-cy="e2e-internal-comments-more-actions"]')
      .first()
      .should('exist');
    cy.get('[data-cy="e2e-internal-comments-more-actions"]').first().click();
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit');
    cy.get('.e2e-more-actions-list button').eq(1).click();
    cy.get('#e2e-internal-comment-edit-textarea')
      .click()
      .clear()
      .type(editedComment);
    cy.get('#e2e-save-internal-comment-edit-button').click();
    cy.get('.e2e-parentcomment').contains(editedComment);

    // Delete comment and check that comment is deleted
    cy.get('[data-cy="e2e-internal-comments-more-actions"]')
      .first()
      .should('exist');
    cy.get('[data-cy="e2e-internal-comments-more-actions"]').first().click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Delete');
    cy.get('.e2e-more-actions-list button').eq(0).click();
    cy.get('#e2e-confirm-internal-comment-deletion').should('exist');
    cy.get('#e2e-confirm-internal-comment-deletion').click();
    cy.get('.e2e-parentcomment').should('not.exist');
  });

  it('allows users to reply to internal comments, edit and delete a reply', () => {
    const internalComment = randomString();
    const replyComment = randomString();
    const editedReply = randomString();
    cy.setAdminLoginCookie();
    cy.visit(`admin/initiatives/${initiativeId2}`);
    cy.acceptCookies();
    // Create comment and check that comment is created
    cy.get('[data-cy="e2e-comments-tab-internal"]').click();
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type(internalComment);
    cy.get('.e2e-submit-parentcomment').click();
    cy.get('.e2e-parentcomment').contains(internalComment);

    // Reply to comment and check that reply is created
    cy.get('.e2e-comment-reply-button').should('exist');
    cy.get('.e2e-comment-reply-button').click();
    cy.get('#e2e-internal-child-comment-text-area').should('exist');
    cy.get('#e2e-internal-child-comment-text-area').click().type(replyComment);
    cy.get('.e2e-submit-childcomment').first().click();
    cy.get('.e2e-internal-child-comment').contains(replyComment);

    cy.wait(1000);

    // Edit reply and check that reply is edited
    cy.get('[data-cy="e2e-internal-comments-more-actions"]')
      .eq(1)
      .should('exist');
    cy.get('[data-cy="e2e-internal-comments-more-actions"]').eq(1).click();
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit');
    cy.get('.e2e-more-actions-list button').eq(1).click();
    cy.get('#e2e-internal-comment-edit-textarea')
      .click()
      .clear()
      .type(editedReply);
    cy.get('#e2e-save-internal-comment-edit-button').click();
    cy.get('.e2e-internal-child-comment').contains(editedReply);

    // Delete reply and check that reply is deleted
    cy.get('[data-cy="e2e-internal-comments-more-actions"]')
      .eq(1)
      .should('exist');
    cy.get('[data-cy="e2e-internal-comments-more-actions"]').eq(1).click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Delete');
    cy.get('.e2e-more-actions-list button').eq(0).click();
    cy.get('#e2e-confirm-internal-comment-deletion').should('exist');
    cy.get('#e2e-confirm-internal-comment-deletion').click();
    cy.get('.e2e-internal-child-comment').contains(
      'This comment has been deleted.'
    );
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId1);
  });
});
