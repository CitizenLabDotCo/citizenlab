import { randomString, randomEmail } from '../support/commands';

describe('Idea show page actions', () => {
  describe('not logged in', () => {
    before(() => {
      cy.visit('/ideas/controversial-idea');
      cy.get('#e2e-idea-show');
      cy.acceptCookies();
    });

    it('asks unauthorised users to log in or sign up before they reaction', () => {
      cy.get('.e2e-reaction-controls .e2e-ideacard-like-button').click();
      cy.get('#e2e-authentication-modal');
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
    describe('Reaction', () => {
      const ideaTitle = randomString();
      let ideaId: string;
      let projectId: string;
      const ideaContent = randomString();

      before(() => {
        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();

        cy.getProjectBySlug('an-idea-bring-it-to-your-council').then(
          (project) => {
            projectId = project.body.data.id;
            cy.apiCreateIdea(projectId, ideaTitle, ideaContent).then((idea) => {
              ideaId = idea.body.data.id;
            });
            cy.apiSignup(firstName, lastName, email, password);
            cy.setLoginCookie(email, password);
          }
        );
      });

      after(() => {
        if (ideaId) {
          cy.apiRemoveIdea(ideaId);
        }
      });

      it('has working up and dislike buttons', () => {
        cy.visit(`/ideas/${ideaTitle}`);
        cy.intercept(`**/ideas/by_slug/${ideaTitle}`).as('ideaRequest');

        cy.wait('@ideaRequest');
        cy.get('#e2e-idea-show').should('exist');

        cy.get('.e2e-reaction-controls').should('exist');
        cy.get('.e2e-ideacard-like-button').should('exist');
        cy.get('.e2e-ideacard-dislike-button').should('exist');

        cy.get('.e2e-reaction-controls')
          .find('.e2e-ideacard-like-button')
          .as('likeBtn');
        cy.get('.e2e-reaction-controls')
          .find('.e2e-ideacard-dislike-button')
          .as('dislikeBtn');

        // initial like & dislike values
        cy.get('@likeBtn').contains('1');
        cy.get('@dislikeBtn').contains('0');

        // add like
        cy.get('@likeBtn').click().wait(1000).contains('2');

        // remove like
        cy.get('@likeBtn').click().wait(1000).contains('1');

        // add dislike
        cy.get('@dislikeBtn').click().wait(1000).contains('1');

        // remove dislike
        cy.get('@dislikeBtn').click().wait(1000).contains('0');

        // add dislike, then like
        cy.get('@dislikeBtn').click().wait(1000);
        cy.get('@likeBtn').click().wait(1000);
        cy.get('@dislikeBtn').contains('0');
        cy.get('@likeBtn').contains('2');
        cy.get('@likeBtn').click().wait(1000);
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
          cy.get('.e2e-parent-and-childcomments')
            .get('.e2e-childcomment')
            .last()
            .contains(commentBody);
        });
      });
    });
  });
});
