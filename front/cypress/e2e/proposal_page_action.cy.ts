import { randomString, randomEmail } from '../support/commands';

describe('Initiative show page actions', () => {
  describe('not logged in', () => {
    before(() => {
      cy.visit('/initiatives/cleaning-the-sidewalks-party');
      cy.get('#e2e-initiative-show');
      cy.acceptCookies();
    });

    it('asks unauthorised users to log in or sign up before they vote', () => {
      cy.wait(500);
      cy.get(
        '#e2e-initiative-vote-control #e2e-initiative-upvote-button'
      ).click();
      cy.get('#e2e-sign-up-in-modal');
    });
  });

  describe('logged in as admin', () => {
    before(() => {
      cy.setAdminLoginCookie();
      cy.visit('/initiatives/cleaning-the-sidewalks-party');
      cy.get('#e2e-initiative-show');
      cy.acceptCookies();
    });

    it('saves a new official feedback, shows it and deletes it', () => {
      const officialFeedbackBody = randomString(30);
      const officialFeedbackAuthor = randomString();

      // input
      cy.get('.e2e-localeswitcher').each((button) => {
        cy.wrap(button).click();
        cy.get('#official-feedback-form textarea').type(officialFeedbackBody);
        cy.get('#official-feedback-form input').type(officialFeedbackAuthor);
      });

      // save
      cy.get('.e2e-official-feedback-form-submit-button').click();
      cy.wait(2000);
      cy.get('.e2e-official-feedback-post-body').contains(officialFeedbackBody);
      cy.get('.e2e-official-feedback-post-author').contains(
        officialFeedbackAuthor
      );
    });
  });

  describe('logged in as normal user', () => {
    describe('Vote', () => {
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();
      const initiativeTitle = randomString();
      const initiativeContent = randomString();

      before(() => {
        cy.apiCreateInitiative({ initiativeTitle, initiativeContent });
        cy.apiSignup(firstName, lastName, email, password);
      });

      beforeEach(() => {
        cy.setLoginCookie(email, password);
        cy.visit(`/initiatives/${initiativeTitle}`);
        cy.wait(500);
        cy.get('#e2e-initiative-show');
      });

      it('adds a vote when you click the upvote button', () => {
        // get upvote button
        cy.get('#e2e-initiative-vote-control')
          .find('#e2e-initiative-upvote-button')
          .as('voteButton');

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

        cy.get('#e2e-initiative-vote-control')
          .find('#e2e-initiative-cancel-upvote-button')
          .as('cancelVoteButton');
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
        cy.setLoginCookie(email, password);
        cy.visit('/initiatives/cleaning-the-sidewalks-party');
        cy.get('#e2e-initiative-show');
        cy.acceptCookies();
      });

      it('shows a working comment input', () => {
        const commentBody = randomString();
        cy.get('#submit-comment')
          .type(commentBody)
          .should('have.value', commentBody);
      });

      describe('Comment', () => {
        it('lets a logged in user reply to a parent comment', () => {
          const commentBody = randomString();
          cy.get('.e2e-comment-reply-button').first().click();
          cy.wait(1000);
          cy.get('.e2e-childcomment-form textarea').first().type(commentBody);
          cy.get('.e2e-submit-childcomment').first().click();
          cy.wait(2000);
          cy.get('.e2e-parent-and-childcomments')
            .get('.e2e-childcomment')
            .last()
            .contains(commentBody);
        });
      });
    });
  });
});
