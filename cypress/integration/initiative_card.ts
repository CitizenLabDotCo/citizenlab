import { randomString, randomEmail } from '../support/commands';

describe('Initiaitve card component', () => {
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
    cy.visit('/initiatives');

    cy.wait(2000);
    cy.get('#e2e-initiatives-list');

    // sort initiatives by newest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();

    cy.wait(2000);
    cy.get('#e2e-initiatives-list');
  });

  it('has a working initiative card', () => {
    // find and save the initiative card
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').contains(initiativeTitle).closest('.e2e-initiative-card').as('initiativeCard');

    // the first card should be the one for the initaitive we just created
    cy.get('.e2e-initiative-card').first().contains(initiativeTitle);

    // the card should contain the title
    cy.get('@initiativeCard').find('.e2e-card-title').contains(initiativeTitle);

    // the card should contain the full initiative author name
    cy.get('@initiativeCard').find('.e2e-username').contains('Sylvester Kalinoski');

    // the card should contain the vote indicator component
    cy.get('@initiativeCard').find('.e2e-initiative-card-vote-indicator');

    // the card should contain a vote count of 1
    cy.get('@initiativeCard').find('.e2e-initiative-card-vote-count').contains(1);

    // the card should contain a comment count of 2
    cy.get('@initiativeCard').find('.e2e-initiativecard-comment-count').contains('2');

    // the card should redirect to the initiative showpage when clicked
    cy.get('@initiativeCard').click();
    cy.wait(3000);
    cy.location('pathname').should('eq', `/en-GB/initiatives/${initiativeTitle}`);
    cy.get('#e2e-initiative-show');
  });

  after(() => {
    cy.apiRemoveComment(childCommentId);
    cy.apiRemoveComment(parentCommentId);
    cy.apiRemoveInitiative(initiativeId);
    cy.apiRemoveUser(userId);
  });
});
