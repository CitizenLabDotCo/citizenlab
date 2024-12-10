import { randomString, randomEmail } from '../support/commands';

describe('Idea card component', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const commentContent = randomString();
  let projectId: string;
  let ideaId: string;
  let userId: string;
  let parentCommentId: string;
  let childCommentId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then((user) => {
        userId = user.body.data.id;
        return cy.getProjectBySlug('an-idea-bring-it-to-your-council');
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreateIdea({
          projectId: project?.body.data.id,
          ideaTitle,
          ideaContent,
        });
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        return cy.apiAddComment(ideaId, commentContent);
      })
      .then((parentComment) => {
        parentCommentId = parentComment.body.data.id;
        return cy.apiAddComment(ideaId, commentContent, parentCommentId);
      })
      .then((childComment) => {
        childCommentId = childComment.body.data.id;
        cy.wait(500);
      });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);

    // visit ideas page and sort idea cards by newest first
    cy.visit('/projects/an-idea-bring-it-to-your-council');

    cy.wait(2000);
    cy.get('#e2e-ideas-list');

    // sort ideas by newest first
    cy.get('#e2e-item-new').click();

    cy.wait(2000);
    cy.get('#e2e-ideas-list');
  });

  it('increments and decrements the reaction count accordingly when the up and dislike buttons are clicked', () => {
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-like-button')
      .as('likeBtn');
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-dislike-button')
      .as('dislikeBtn');

    // check initial likes & dislikes
    cy.get('@likeBtn').contains('1');
    cy.get('@dislikeBtn').contains('0');

    // add like
    cy.wait(500);
    cy.get('@likeBtn').click();
    cy.wait(1000);
    cy.get('@likeBtn').contains('2');

    // remove like
    cy.wait(500);
    cy.get('@likeBtn').click();
    cy.wait(1000);
    cy.get('@likeBtn').contains('1');

    // add dislike
    cy.wait(500);
    cy.get('@dislikeBtn').click();
    cy.wait(1000);
    cy.get('@dislikeBtn').contains('1');

    // remove dislike
    cy.wait(500);
    cy.get('@dislikeBtn').click();
    cy.wait(1000);
    cy.get('@dislikeBtn').contains('0');

    // add dislike, then like
    cy.get('@dislikeBtn').wait(500).click().wait(1000);
    cy.get('@likeBtn').wait(500).click().wait(1000);
    cy.get('@dislikeBtn').contains('0');
    cy.get('@likeBtn').contains('2');
  });

  it('shows the correct comment count', () => {
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-comment-count')
      .contains('2');
  });

  after(() => {
    cy.apiRemoveComment(childCommentId);
    cy.apiRemoveComment(parentCommentId);
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveUser(userId);
  });
});
