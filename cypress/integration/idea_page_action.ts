const email = 'admin@citizenlab.co';
const password = 'testtest';

describe('Project ideas page', () => {

  describe('Votes & Comments Actions', () => {
    describe('unauthorized', () => {
      beforeEach(() => {
        cy.visit('/ideas/controversial-idea');
        cy.acceptCookies();
      });
      it('asks unauthorised users to log in or sign up before they vote', () => {
        cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
        cy.get('.e2e-vote-controls-desktop').find('.e2e-login-button');
        cy.get('.e2e-vote-controls-desktop').find('.e2e-register-button');
      });
    });

    describe('authorised admin', () => {
      beforeEach(() => {
        cy.login(email, password);
        cy.visit('/ideas/controversial-idea');
        cy.acceptCookies();
      });
      describe('Comment', () => {
        it('lets authorized users reply to comments and delete their answer', () => {
          const commentThread = cy.get('.e2e-comment-thread').first();
          commentThread.get('#e2e-reply').type('test').should('have.value', 'test');
          commentThread.get('.e2e-send-reply').first().click();
          cy.wait(100);
          const getMyComment = () => commentThread.get('.e2e-child-comment').last();
          getMyComment().contains('test');
          getMyComment().find('.e2e-more-actions').click();
          getMyComment().find('.e2e-more-actions').find('.tooltip-content').find('button').first().click();
          cy.get('.e2e-confirm-deletion').click();
          commentThread.get('.e2e-child-comment').should('have.length', 2);
        });
      });
      describe('Vote', () => {
        it('lets authorized users vote up and take it back', () => {
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').contains('1');
          cy.wait(200); // for animation to end
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').contains('0');
        });
        it('lets authorized users vote down and take it back', () => {
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').contains('1');
          cy.wait(200); // for animation to end
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').contains('0');
        });
        it('lets authorized users change their vote', () => {
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').contains('1');
          cy.wait(200); // for animation to end
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').contains('1');
          cy.wait(200); // for animation to end
          // and change their mind so dataset is clean
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').click();
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').contains('0');
        });
      });
    });
  });
});
