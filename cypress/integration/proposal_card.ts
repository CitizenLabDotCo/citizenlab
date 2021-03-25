import { randomString, randomEmail } from '../support/commands';

describe('Proposal card component', () => {
  describe('card', () => {
    const initiativeTitle = randomString();
    const initiativeContent = Math.random().toString(36);
    let initiativeId: string;

    before(() => {
      cy.apiCreateInitiative({ initiativeTitle, initiativeContent }).then(
        (initiaitve) => {
          initiativeId = initiaitve.body.data.id;
          cy.wait(2000);
        }
      );
    });

    it('contains the correct information on the card', () => {
      cy.visit('/initiatives');
      cy.get('#e2e-initiatives-list');
      cy.get('#e2e-initiatives-sort-dropdown').click();
      cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
      cy.wait(500);
      cy.get('#e2e-initiatives-list');
      cy.wait(1000);

      cy.get('#e2e-initiatives-list .e2e-initiative-card')
        .first()
        .as('initiativeCard');

      // the first card should be the one for the initaitive we just created
      cy.get('@initiativeCard').contains(initiativeTitle);

      // the card should contain the title
      cy.get('@initiativeCard')
        .find('.e2e-card-title')
        .contains(initiativeTitle);

      // the card should contain the full initiative author name
      cy.get('@initiativeCard')
        .find('.e2e-username')
        .contains('Sylvester Kalinoski');

      // the card should contain the vote indicator component
      cy.get('@initiativeCard').find('.e2e-initiative-card-vote-indicator');

      // the card should contain a vote count of 1
      cy.get('@initiativeCard')
        .find('.e2e-initiative-card-vote-count')
        .contains('1');

      // the card should contain a comment count of 0
      cy.get('@initiativeCard')
        .find('.e2e-initiativecard-comment-count')
        .contains('0');

      // the card should redirect to the initiative showpage when clicked
      cy.get('@initiativeCard').click();
      cy.wait(2000);
      cy.location('pathname').should(
        'eq',
        `/en/initiatives/${initiativeTitle}`
      );
      cy.get('#e2e-initiative-show');
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
    });
  });

  describe('vote count', () => {
    let initiativeId: string;

    before(() => {
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();
      const initiativeTitle = randomString();
      const initiativeContent = Math.random().toString(36);

      cy.apiSignup(firstName, lastName, email, password)
        .then(() => {
          return cy.apiCreateInitiative({ initiativeTitle, initiativeContent });
        })
        .then((initiative) => {
          initiativeId = initiative.body.data.id;
          cy.apiUpvoteInitiative(email, password, initiativeId);
          cy.wait(2000);
        });
    });

    it('correctly increments the vote count', () => {
      cy.visit('/initiatives');
      cy.get('#e2e-initiatives-list');
      cy.get('#e2e-initiatives-sort-dropdown').click();
      cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
      cy.wait(500);
      cy.get('#e2e-initiatives-list');
      cy.wait(1000);

      // the card should contain a vote count of 2
      cy.get('#e2e-initiatives-list .e2e-initiative-card')
        .first()
        .find('.e2e-initiative-card-vote-count')
        .contains('2');
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
    });
  });

  describe('comment count', () => {
    let initiativeId: string;
    let parentCommentId: string;
    let childCommentId: string;

    before(() => {
      const initiativeTitle = randomString();
      const initiativeContent = Math.random().toString(36);
      const commentContent = randomString();

      cy.apiCreateInitiative({ initiativeTitle, initiativeContent })
        .then((initiaitve) => {
          initiativeId = initiaitve.body.data.id;
          return cy.apiAddComment(initiativeId, 'initiative', commentContent);
        })
        .then((parentComment) => {
          parentCommentId = parentComment.body.data.id;
          return cy.apiAddComment(
            initiativeId,
            'initiative',
            commentContent,
            parentCommentId
          );
        })
        .then((childComment) => {
          childCommentId = childComment.body.data.id;
          cy.wait(2000);
        });
    });

    it('correctly increments the comment count', () => {
      cy.visit('/initiatives');
      cy.get('#e2e-initiatives-list');
      cy.get('#e2e-initiatives-sort-dropdown').click();
      cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
      cy.wait(500);
      cy.get('#e2e-initiatives-list');
      cy.wait(1000);

      // the card should contain a comment count of 2
      cy.get('#e2e-initiatives-list .e2e-initiative-card')
        .first()
        .find('.e2e-initiativecard-comment-count')
        .contains('2');
    });

    after(() => {
      cy.apiRemoveComment(childCommentId);
      cy.apiRemoveComment(parentCommentId);
      cy.apiRemoveInitiative(initiativeId);
    });
  });
});
