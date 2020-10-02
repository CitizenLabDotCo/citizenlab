import { randomString, randomEmail } from '../support/commands';

describe('Idea show page actions', () => {
  describe('not logged in', () => {
    before(() => {
      cy.visit('/ideas/controversial-idea');
      cy.get('#e2e-idea-show');
      cy.acceptCookies();
    });

    it('asks unauthorised users to log in or sign up before they vote', () => {
      cy.get('.e2e-vote-controls .e2e-ideacard-upvote-button').click();
      cy.get('#e2e-sign-up-in-modal');
      cy.get('#e2e-sign-up-container');
    });
  });

  describe('logged in as admin', () => {
    before(() => {
      cy.setAdminLoginCookie();
      cy.visit('/ideas/controversial-idea');
      cy.get('#e2e-idea-show');
      cy.acceptCookies();
    });

    it('saves a new official feedback, shows it and deletes it', () => {
      const officialFeedbackBody = randomString(30);
      const officialFeedbackAuthor = randomString();

      cy.get('.e2e-localeswitcher').each((button) => {
        // input
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
      before(() => {
        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();
        const ideaTitle = randomString();
        const ideaContent = randomString();

        cy.getProjectBySlug('an-idea-bring-it-to-your-council').then(
          (project) => {
            const projectId = project.body.data.id;
            cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
            cy.apiSignup(firstName, lastName, email, password);
            cy.setLoginCookie(email, password);
            cy.visit(`/ideas/${ideaTitle}`);
            cy.get('#e2e-idea-show');
          }
        );
      });

      it('has working up and downvote buttons', () => {
        cy.get('.e2e-vote-controls')
          .find('.e2e-ideacard-upvote-button')
          .as('upvoteBtn');
        cy.get('.e2e-vote-controls')
          .find('.e2e-ideacard-downvote-button')
          .as('downvoteBtn');

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
        cy.setLoginCookie(email, password);
        cy.visit('/ideas/controversial-idea');
        cy.acceptCookies();
        cy.get('#e2e-idea-show');
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
          cy.get('#e2e-parent-and-childcomments')
            .get('.e2e-childcomment')
            .last()
            .contains(commentBody);
        });
      });
    });
  });
});
