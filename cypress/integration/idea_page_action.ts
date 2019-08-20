import { randomString, randomEmail } from '../support/commands';

describe('Idea show page actions', () => {
  describe('not logged in', () => {
    before(() => {
      cy.visit('/ideas/controversial-idea');
      cy.acceptCookies();
      cy.get('#e2e-idea-show');
    });

    it('asks unauthorised users to log in or sign up before they vote', () => {
      cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
      cy.get('.e2e-vote-controls-desktop').find('.e2e-login-button');
      cy.get('.e2e-vote-controls-desktop').find('.e2e-register-button');
    });
  });

  describe('logged in as admin', () => {
    before(() => {
      cy.login('admin@citizenlab.co', 'testtest');
      cy.visit('/ideas/controversial-idea');
      cy.acceptCookies();
      cy.get('#e2e-idea-show');
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
        const ideaTitle = randomString();
        const ideaContent = randomString();

        cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
          const projectId = project.body.data.id;
          cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
          cy.apiSignup(firstName, lastName, email, password);
          cy.login(email, password);
          cy.visit(`/ideas/${ideaTitle}`);
          cy.wait(3000);
          cy.get('#e2e-idea-show');
        });
      });

      it('has working up and downvote buttons', () => {
        cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
        cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

        // initial upvote & downvote values
        cy.get('@upvoteBtn').contains('1');
        cy.get('@downvoteBtn').contains('0');

        // add upvote
        cy.get('@upvoteBtn').click().wait(1000).contains('2');

        // remove upvote
        cy.get('@upvoteBtn').click().wait(1000).contains('1');

        // add downvote
        cy.get('@downvoteBtn').click().wait(1000).contains('1');

        // remove downvote
        cy.get('@downvoteBtn').click().wait(1000).contains('0');

        // add downvote, then upvote
        cy.get('@downvoteBtn').click().wait(1000);
        cy.get('@upvoteBtn').click().wait(1000);
        cy.get('@downvoteBtn').contains('0');
        cy.get('@upvoteBtn').contains('2');
        cy.get('@upvoteBtn').click().wait(1000);
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
