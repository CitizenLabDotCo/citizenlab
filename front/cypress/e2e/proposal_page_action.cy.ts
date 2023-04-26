import { randomEmail, randomString } from '../support/commands';

describe('Initiative show page actions', () => {
  describe('not logged in', () => {
    const initiativeTitle = randomString();
    const initiativeContent = Math.random().toString(36);
    let initiativeId: string;
    let initiativeSlug: string;

    before(() => {
      cy.apiCreateInitiative({ initiativeTitle, initiativeContent })
        .then((initiative) => {
          initiativeId = initiative.body.data.id;
          initiativeSlug = initiative.body.data.attributes.slug;
        })
        .then(() => {
          cy.clearCookies();
          cy.visit(`/initiatives/${initiativeSlug}`);
          cy.get('#e2e-initiative-show');
          cy.acceptCookies();
        });
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
    });

    it('asks unauthorised users to log in or sign up before they vote', () => {
      cy.wait(500);
      cy.get(
        '#e2e-initiative-vote-control #e2e-initiative-upvote-button'
      ).should('exist');
      cy.get(
        '#e2e-initiative-vote-control #e2e-initiative-upvote-button'
      ).click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');
    });
  });

  describe('logged in as admin', () => {
    const initiativeTitle = randomString();
    const initiativeContent = Math.random().toString(36);
    let initiativeId: string;
    let initiativeSlug: string;

    before(() => {
      cy.apiCreateInitiative({ initiativeTitle, initiativeContent })
        .then((initiative) => {
          initiativeId = initiative.body.data.id;
          initiativeSlug = initiative.body.data.attributes.slug;
        })
        .then(() => {
          cy.setAdminLoginCookie();
          cy.visit(`/initiatives/${initiativeSlug}`);
          cy.get('#e2e-initiative-show');
        });
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
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
      cy.get('.e2e-official-feedback-post-body').should('exist');
      cy.get('.e2e-official-feedback-post-body').contains(officialFeedbackBody);
      cy.get('.e2e-official-feedback-post-author').contains(
        officialFeedbackAuthor
      );
    });
  });

  describe('logged in as normal user', () => {
    describe('Vote', () => {
      const initiativeTitle = randomString();
      const initiativeContent = randomString();
      const firstName = randomString();
      const lastName = randomString();
      const password = randomString();
      const email = randomEmail();
      let initiativeId = '';
      let initiativeSlug = '';

      before(() => {
        cy.apiSignup(firstName, lastName, email, password);
        cy.apiLogin(email, password);
        cy.apiCreateInitiative({ initiativeTitle, initiativeContent }).then(
          (initiative) => {
            initiativeId = initiative.body.data.id;
            initiativeSlug = initiative.body.data.attributes.slug;
          }
        );
      });

      beforeEach(() => {
        cy.setLoginCookie(email, password);
        cy.visit(`/initiatives/${initiativeSlug}`);
        cy.get('#e2e-initiative-show').should('exist');
      });

      after(() => {
        cy.apiRemoveInitiative(initiativeId);
      });

      it('adds and removes vote when vote buttons clicked', () => {
        // get upvote button
        cy.get('#e2e-initiative-vote-control')
          .find('#e2e-initiative-upvote-button')
          .as('voteButton');

        // get initial vote count
        cy.get('#e2e-initiative-not-voted-vote-count').contains('1 vote');
        // upvote initiative
        cy.get('@voteButton').click({ force: true });
        cy.get('#e2e-initiative-voted-vote-count').contains('2 votes');

        // get cancel vote button
        cy.get('#e2e-initiative-vote-control')
          .find('#e2e-initiative-cancel-upvote-button')
          .as('cancelVoteButton');

        // current vote count
        cy.get('#e2e-initiative-voted-vote-count').contains('2 votes');

        cy.get('#e2e-initiative-vote-control')
          .find('#e2e-initiative-cancel-upvote-button')
          .as('cancelVoteButton');
        cy.get('@cancelVoteButton').click();

        // confirm vote count went down
        cy.get('#e2e-initiative-not-voted-vote-count').should('exist');
        cy.get('#e2e-initiative-not-voted-vote-count').contains('1 vote');
      });
    });

    describe('Comments', () => {
      const initiativeTitle = randomString();
      const initiativeContent = randomString();
      const firstName = randomString();
      const lastName = randomString();
      const password = randomString();
      const email = randomEmail();
      let initiativeId = '';
      let initiativeSlug = '';

      before(() => {
        cy.apiSignup(firstName, lastName, email, password);
        cy.apiLogin(email, password);
        cy.apiCreateInitiative({ initiativeTitle, initiativeContent }).then(
          (initiative) => {
            initiativeId = initiative.body.data.id;
            initiativeSlug = initiative.body.data.attributes.slug;
          }
        );
      });

      beforeEach(() => {
        cy.setLoginCookie(email, password);
        cy.visit(`/initiatives/${initiativeSlug}`);
        cy.get('#e2e-initiative-show').should('exist');
      });

      after(() => {
        cy.apiRemoveInitiative(initiativeId);
      });

      it('has a working comment and comment reply input ', () => {
        const commentBody = randomString();
        cy.get('#submit-comment')
          .type(commentBody)
          .should('have.value', commentBody);
        cy.contains('Post your comment').click();
        cy.contains('Reply').click();
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
