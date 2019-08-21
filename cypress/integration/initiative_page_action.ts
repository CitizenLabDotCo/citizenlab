import { randomString, randomEmail } from '../support/commands';

describe('Initiative show page actions', () => {
  describe('not logged in', () => {
    // before(() => {
    //   cy.visit('/initiatives/cleaning-the-sidewalks-party');
    //   cy.acceptCookies();
    //   cy.get('#e2e-initiative-show');
    // });

    // it('asks unauthorised users to log in or sign up before they vote', () => {
    //   cy.wait(1000);
    //   cy.get('#e2e-initiative-vote-control').find('#e2e-initiative-upvote-button').click();
    //   cy.get('#e2e-initiative-vote-control').find('.e2e-login-button');
    //   cy.get('#e2e-initiative-vote-control').find('.e2e-register-button');
    // });
  });

  describe('logged in as admin', () => {
    before(() => {
      cy.login('admin@citizenlab.co', 'testtest');
      cy.visit('/initiatives/cleaning-the-sidewalks-party');
      cy.acceptCookies();
      cy.get('#e2e-initiative-show');
    });

    it('saves a new official feedback, shows it and deletes it', () => {
      const officialFeedback = randomString(30);
      // input
      cy.get('input').first().type(officialFeedback);
      cy.get('textarea').first().type(officialFeedback);

      // save
      cy.get('.e2e-submit-wrapper-button').click();
      cy.get('.e2e-submit-wrapper-button').should('have.class', 'disabled');
      cy.wait(1000);

      cy.get('.e2e-official-feedback-post').contains(officialFeedback);
      cy.get('.e2e-official-feedback-post').contains(officialFeedback);

      // delete
      cy.get('.e2e-official-feedback-post').find('button').first().click();
      cy.get('.e2e-official-feedback-post').find('.e2e-action-delete').click();

      cy.wait(1000);
      cy.get('.e2e-official-feedback-post').should('not.exist');
    });
  });

  describe('logged in as normal user', () => {
    describe('Vote', () => {
      before(() => {
        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();
        const initiativeTitle = randomString();
        const initiativeContent = randomString();

        cy.apiCreateInitiative(initiativeTitle, initiativeContent);
        cy.apiSignup(firstName, lastName, email, password);
        cy.login(email, password);
        cy.visit(`/initiatives/${initiativeTitle}`);
        cy.wait(3000);
        cy.get('#e2e-initiative-show');
      });

      it('adds a vote when you click the upvote button', () => {
        // get upvote button
        cy.get('#e2e-initiative-vote-control').find('#e2e-initiative-upvote-button').as('voteButton');

        // get initial vote count
        cy.get('#e2e-initiative-not-voted-vote-count').contains('1 vote');
        // upvote initiative
        cy.get('@voteButton').click();
        cy.wait(1000);
        cy.get('#e2e-initiative-voted-vote-count').contains('2 votes');
      });

      it('removes a vote when you click the cancel vote button', () => {
        // current vote count
        cy.get('#e2e-initiative-voted-vote-count').contains('2 votes');

        cy.get('#e2e-initiative-vote-control').find('#e2e-initiative-cancel-upvote-button').as('cancelVoteButton');
        cy.get('@cancelVoteButton').click();
        cy.wait(2500);

        // confirm vote count went down
        cy.get('#e2e-initiative-not-voted-vote-count').contains('1 vote');

      });
    });

    describe('Comments', () => {
      const email = randomEmail();
      const password = randomString();

      before(() => {
        const firstName = randomString();
        const lastName = randomString();
        cy.apiSignup(firstName, lastName, email, password);
      });

      beforeEach(() => {
        cy.login(email, password);
        cy.visit('/ideas/controversial-idea');
        cy.acceptCookies();
        cy.get('#e2e-idea-show');
      });

      it('shows a working comment input', () => {
        const commentBody = randomString();
        cy.get('#submit-comment').type(commentBody).should('have.value', commentBody);
      });

      describe('Comment', () => {
        it('lets a logged in user reply to a parent comment', () => {
          const commentBody = randomString();
          cy.get('.e2e-comment-reply-button').first().click();
          cy.wait(1000);
          cy.get('.e2e-childcomment-form textarea').first().type(commentBody);
          cy.get('.e2e-submit-childcomment').first().click();
          cy.wait(2000);
          cy.get('#e2e-parent-and-childcomments').get('.e2e-childcomment').last().contains(commentBody);
        });
      });
    });
  });
});
