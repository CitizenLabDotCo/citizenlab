import { randomString, randomEmail } from '../support/commands';

describe('Idea card component', () => {
  it('increments and decrements the vote count accordingly when the up and downvote buttons are clicked', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();

    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId = project.body.data.id;

      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);

      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

      // initial upvote value
      cy.get('@upvoteBtn').contains('1');

      // initial downvote
      cy.get('@downvoteBtn').contains('0');

      // click upvote
      cy.get('@upvoteBtn').click().wait(500).contains('2');

      // click upvote
      cy.get('@upvoteBtn').click().wait(500).contains('1');

      // click downvote
      cy.get('@downvoteBtn').click().wait(500).contains('1');

      // click downvote
      cy.get('@downvoteBtn').click().wait(500).contains('0');

      // click downvote, then upvote
      cy.get('@downvoteBtn').click().wait(500);
      cy.get('@upvoteBtn').click().wait(500);
      cy.get('@downvoteBtn').contains('0');
      cy.get('@upvoteBtn').contains('2');
    });
  });

  it('increases and decreases the comments count accordingly when a parent and child comment are added or removed', () => {
    const ideaTitle = randomString();
    const ideaContent = Math.random().toString(36);
    const commentContent = randomString();
    let ideaId: string = null as any;
    let parentCommentId: string = null as any;
    let childCommentId: string = null as any;

    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId = project.body.data.id;
      return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
    }).then((idea) => {
      ideaId = idea.body.data.id;

      // add parent comment
      return cy.apiAddComment(ideaId, commentContent);
    }).then((parentComment) => {
      parentCommentId = parentComment.body.data.id;
      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-comment-count').as('commentCount');
      cy.get('@commentCount').contains('1');

      // add child comment
      return cy.apiAddComment(ideaId, commentContent, parentCommentId);
    }).then((childComment) => {
      childCommentId = childComment.body.data.id;
      cy.visit('/ideas');
      cy.get('@commentCount').contains('2');

      // remove child comment
      return cy.apiRemoveComment(childCommentId);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('@commentCount').contains('1');

      // remove parent comment
      cy.apiRemoveComment(parentCommentId);

      // recheck comment count
      cy.visit('/ideas');
      cy.get('@commentCount').contains('0');
    });
  });
});
