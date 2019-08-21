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

  it('bleh', () => {
    // find and save the initiative card
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').contains(initiativeTitle).closest('.e2e-initiative-card').as('initiativeCard');

    // the first card should be the one for the initaitive we just created
    cy.get('.e2e-initiative-card').first().contains(initiativeTitle);

    // the card should contain the title
    cy.get('@initiativeCard').find('.e2e-card-component-title').contains(initiativeTitle);

    // the card should contain one vote
    cy.get('@initiativeCard').find('.e2e-initiative-card-vote-indicator-count').contains(1);
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
