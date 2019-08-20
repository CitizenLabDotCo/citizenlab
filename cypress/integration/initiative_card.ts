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
      return cy.apiCreateInitiative(initiativeTitle, initiativeContent);
    }).then((initiaitve) => {
      initiativeId = initiaitve.body.data.id;
      return cy.apiAddComment(initiativeId, 'initiative', commentContent);
    }).then((parentComment) => {
      parentCommentId = parentComment.body.data.id;
      return cy.apiAddComment(initiativeId, 'initiative', commentContent, parentCommentId);
    }).then((childComment) => {
      childCommentId = childComment.body.data.id;
      cy.login(email, password);
    });
  });

  beforeEach(() => {
    // visit initiatives page and sort initiative cards by newest first
    cy.visit('/initiaitves');

    cy.wait(2000);
    cy.get('#e2e-initiatives-list');

    // sort initiatives by newest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();

    cy.wait(2000);
    cy.get('#e2e-initiatives-list');
  });

  it('increments and decrements the vote count accordingly when the up and downvote buttons are clicked', () => {
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').contains(initiativeTitle).closest('.e2e-initiative-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').contains(initiativeTitle).closest('.e2e-initiative-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

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
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').contains(initiativeTitle).closest('.e2e-initiative-card').find('.e2e-ideacard-comment-count').contains('2');
  });

  after(() => {
    cy.apiRemoveComment(childCommentId);
    cy.apiRemoveComment(parentCommentId);
    cy.apiRemoveInitiative(initiativeId);
    cy.apiRemoveUser(userId);
  });
});
