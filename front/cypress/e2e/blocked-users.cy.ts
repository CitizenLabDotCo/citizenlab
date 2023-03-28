import { randomString, randomEmail } from '../support/commands';

describe('Blocked user', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      const unverifiedId = response.body.data.id;
      cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
        const adminJwt = response.body.jwt;
        cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'PATCH',
          url: `web_api/v1/users/${unverifiedId}/block`,
          body: {
            block_reason: 'Test block reason',
          },
        });
      });
    });

    cy.apiLogin(email, password).then((response) => {
      cy.apiVerifyBogus(response.body.jwt);
    });
  });

  it('sends blocked users to the blocked page', () => {
    cy.setLoginCookie(email, password);
    cy.visit('profile/edit');
    cy.wait(1000);
    cy.contains('Your account has been temporarily disabled');
  });

  it('Should not be able to comment', () => {
    cy.setLoginCookie(email, password);
    cy.visit('ideas/verified-idea');
    cy.get('.e2e-parent-comment-form').should('not.exist');
  });

  it('Should not be able to vote comments', () => {
    cy.setLoginCookie(email, password);
    cy.visit('ideas/verified-idea');
    cy.get('.e2e-comment-vote').click();
    cy.get('.e2e-comment-vote.voted').should('not.exist');
  });

  it('Should not be able to vote ideas', () => {
    cy.setLoginCookie(email, password);
    cy.visit('ideas/verified-idea');
    cy.get('.e2e-ideacard-upvote-button').should('not.exist');
    cy.get('.e2e-ideacard-downvote-button').should('not.exist');
  });

  it('Should not be able to fill in platform surveys', () => {
    cy.setLoginCookie(email, password);
    cy.visit('ideas/verified-poll');
    cy.get('.e2e-poll-question').should('not.exist');
  });

  it('Should not be able to assign baskets to budget', () => {
    cy.setLoginCookie(email, password);
    cy.visit('projects/verified-participatory-budgeting');
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket');
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .click();
    cy.wait(1000);
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket');
  });
});
