import { randomString, randomEmail } from '../support/commands';

describe('Idea card component', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const initiativeTitle = randomString();
  const initiativeContent = Math.random().toString(36);
  const commentContent = randomString();
  let initiativeId: string;
  let userId: string;
  let parentCommentId: string;
  let childCommentId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then(userResponse => {
      userId = userResponse.body.data.id;
    });

    cy.apiCreateInitiative(projectId, initiativeTitle, initiativeContent).then((initiative) => {
      initiativeId = initiative.body.data.id;
      return cy.apiAddCommentToIdea(initiativeId, commentContent);
    }).then((parentComment) => {
      parentCommentId = parentComment.body.data.id;
      return cy.apiAddCommentToIdea(initiativeId, commentContent, parentCommentId);
    }).then((childComment) => {
      childCommentId = childComment.body.data.id;
      cy.login(email, password);
    });
  });

  beforeEach(() => {
    // visit ideas page and sort idea cards by newest first
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');

    cy.wait(2000);
    cy.get('#e2e-ideas-list');

    // sort ideas by newest first
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();

    cy.wait(2000);
    cy.get('#e2e-ideas-list');
  });

  it('increments and decrements the vote count accordingly when the up and downvote buttons are clicked', () => {
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').contains(initiativeTitle).closest('.e2e-idea-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').contains(initiativeTitle).closest('.e2e-idea-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

    // check initial upvotes & downvotes
    cy.get('@upvoteBtn').contains('1');
    cy.get('@downvoteBtn').contains('0');

    // add upvote
    cy.get('@upvoteBtn').wait(500).click().wait(1000).contains('2');

    // remove upvote
    cy.get('@upvoteBtn').wait(500).click().wait(1000).contains('1');

    // add downvote
    cy.get('@downvoteBtn').wait(500).click().wait(1000).contains('1');

    // remove downvote
    cy.get('@downvoteBtn').wait(500).click().wait(1000).contains('0');

    // add downvote, then upvote
    cy.get('@downvoteBtn').wait(500).click().wait(1000);
    cy.get('@upvoteBtn').wait(500).click().wait(1000);
    cy.get('@downvoteBtn').contains('0');
    cy.get('@upvoteBtn').contains('2');
  });

  it('shows the correct comment count', () => {
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').contains(initiativeTitle).closest('.e2e-idea-card').find('.e2e-ideacard-comment-count').contains('2');
  });

  after(() => {
    cy.apiRemoveComment(childCommentId);
    cy.apiRemoveComment(parentCommentId);
    cy.apiRemoveIdea(initiativeId);
    cy.apiRemoveUser(userId);
  });
});
