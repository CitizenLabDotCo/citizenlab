import { randomEmail, randomString } from '../support/commands';

describe('Initiative show page actions', () => {
  describe('not logged in', () => {
    const initiativeTitle = randomString();
    const initiativeContent = Math.random().toString(36);
    let initiativeId: string;
    let initiativeSlug: string;

    it('asks unauthorised users to log in or sign up before they react', () => {
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

      cy.get('#e2e-initiative-like-button').should('exist');
      cy.wait(2000);
      cy.get('#e2e-initiative-like-button').click();
      cy.get('#e2e-authentication-modal').should('exist');

      cy.apiRemoveInitiative(initiativeId);
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
          cy.clearCookies();
          cy.setAdminLoginCookie();
          cy.visit(`/initiatives/${initiativeSlug}`);
          cy.get('#e2e-initiative-show');
        });
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
    });

    it('saves a new official feedback and shows it', () => {
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
    describe('Reaction', () => {
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

      it('adds and removes reaction when reaction buttons clicked', () => {
        // get like button
        cy.get('#e2e-initiative-reaction-control')
          .find('#e2e-initiative-like-button')
          .as('reactionButton');

        // get initial reaction count
        cy.get('#e2e-initiative-not-reacted-reaction-count').contains('1 vote');
        // like initiative
        cy.get('@reactionButton').click({ force: true });
        cy.get('#e2e-initiative-reacted-reaction-count').contains('2 votes');

        // get cancel reaction button
        cy.get('#e2e-initiative-reaction-control')
          .find('#e2e-initiative-cancel-like-button')
          .as('cancelReactionButton');

        // current reaction count
        cy.get('#e2e-initiative-reacted-reaction-count').contains('2 votes');

        cy.get('#e2e-initiative-reaction-control')
          .find('#e2e-initiative-cancel-like-button')
          .as('cancelReactionButton');
        cy.get('@cancelReactionButton').click();

        // confirm reaction count went down
        cy.get('#e2e-initiative-not-reacted-reaction-count').should('exist');
        cy.get('#e2e-initiative-not-reacted-reaction-count').contains('1 vote');
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
        cy.clearCookies();
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
        cy.get('.e2e-submit-parentcomment').click({ force: true });
        cy.get('.e2e-comment-reply-button').first().click({ force: true });
        cy.get('.e2e-childcomment-form textarea').should('exist');
        cy.get('.e2e-childcomment-form textarea').first().type(commentBody);
        cy.get('.e2e-submit-childcomment').first().click();
        cy.get('.e2e-parent-and-childcomments').should('exist');
        cy.contains(commentBody).should('exist');
      });
    });
  });
});
