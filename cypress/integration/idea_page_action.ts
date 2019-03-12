import { randomString, randomEmail } from '../support/commands';

const email = 'admin@citizenlab.co';
const password = 'testtest';
const salt = randomString();

const firstName = randomString();
const lastName = randomString();
const peasantEmail = randomEmail();
const peasantPassword = randomString();

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
        cy.get('#e2e-idea-show');
      });
      describe('Feedback', () => {
        it('saves a new feedback and deletes it', () => {
          // input
          cy.get('input').first().type(`test title ${salt}`);
          cy.get('textarea').first().type(`test body ${salt}`);

          // save
          cy.get('.e2e-submit-wrapper-button').click();
          cy.get('.e2e-submit-wrapper-button').should('have.class', 'disabled');
          cy.wait(700);

          cy.get('.e2e-official-feedback-post').contains(`test title ${salt}`);
          cy.get('.e2e-official-feedback-post').contains(`test body ${salt}`);

          // delete
          cy.get('.e2e-official-feedback-post').find('button').first().click();
          cy.get('.e2e-official-feedback-post').find('.e2e-action-delete').click();

          cy.wait(700);
          cy.get('.e2e-official-feedback-post').should('not.exist');
        });
      });
      describe('Comment', () => {
        it('lets authorized admins reply to comments and delete their answer', () => {
          const commentThread = cy.get('.e2e-comment-thread').first();
          const commentBody = `test${salt}`;
          commentThread.get('#e2e-reply').type(commentBody).should('have.value', commentBody);
          commentThread.get('.e2e-send-reply').first().click();
          cy.wait(700);
          const getMyComment = () => commentThread.get('.e2e-child-comment').last();
          getMyComment().contains(commentBody);
          getMyComment().find('.e2e-more-actions').click();
          getMyComment().find('.e2e-more-actions').find('.tooltip-content').find('button').first().click();
          cy.get('.e2e-confirm-deletion').click();
          cy.wait(700);
          getMyComment().contains(commentBody).should('not.exist');
        });
      });
    });
    describe('authorised peasant', () => {
      before(() => {
        cy.apiSignup(firstName, lastName, peasantEmail, peasantPassword);
      });
      beforeEach(() => {
        cy.login(peasantEmail, peasantPassword);
        cy.visit('/ideas/controversial-idea');
        cy.acceptCookies();
        cy.get('#e2e-idea-show');
      });
      describe('Vote', () => {
        it('lets authorized users vote as expected', () => {
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
          cy.get('.e2e-vote-controls-desktop').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

          // initial upvote & downvote values
          cy.get('@upvoteBtn').contains('0');
          cy.get('@downvoteBtn').contains('0');

          // add upvote
          cy.get('@upvoteBtn').click().wait(1000).contains('1');

          // remove upvote
          cy.get('@upvoteBtn').click().wait(1000).contains('0');

          // add downvote
          cy.get('@downvoteBtn').click().wait(1000).contains('1');

          // remove downvote
          cy.get('@downvoteBtn').click().wait(1000).contains('0');

          // add downvote, then upvote
          cy.get('@downvoteBtn').click().wait(1000);
          cy.get('@upvoteBtn').click().wait(1000);
          cy.get('@downvoteBtn').contains('0');
          cy.get('@upvoteBtn').contains('1');
          cy.get('@upvoteBtn').click().wait(1000);
        });
      });
      describe('Comment', () => {
        it('shows a working comment input', () => {
          const commentBody = `test${salt}`;
          cy.get('#submit-comment').type(commentBody).should('have.value', commentBody);
        });
      });
    });
  });
});
