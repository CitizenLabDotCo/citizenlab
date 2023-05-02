import { randomString, randomEmail } from '../support/commands';

describe('Blocked user', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
        const adminJwt = response.body.jwt;
        cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'PATCH',
          url: `web_api/v1/app_configuration`,
          body: {
            settings: {
              user_blocking: {
                enabled: true,
                allowed: true,
              },
            },
          },
        });
        cy.request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'PATCH',
          url: `web_api/v1/users/${userId}/block`,
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

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });

  it('Sends blocked users to the blocked page', () => {
    cy.visit('profile/edit');
    cy.contains('Your account has been temporarily disabled');
  });

  it('Should not be able to vote comments', () => {
    cy.visit('ideas/verified-idea');
    cy.get('.e2e-comment-vote').click({ force: true });
    cy.get('.e2e-comment-vote.voted').should('not.exist');
  });
});
