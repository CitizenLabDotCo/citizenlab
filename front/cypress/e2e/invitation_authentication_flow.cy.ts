import { randomString, randomEmail } from '../support/commands';

function getInvites() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: 'web_api/v1/invites?page%5Bnumber%5D=1&page%5Bsize%5D=20&sort=-created_at',
    });
  });
}

function deleteInvites() {
  return cy.apiLogin('admin@citizenlab.co', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy
      .request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'GET',
        url: 'web_api/v1/invites?page%5Bnumber%5D=1&page%5Bsize%5D=20&sort=-created_at',
      })
      .then((response) => {
        const invites = response.body.data;

        invites.forEach(({ id }: any) => {
          cy.request({
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminJwt}`,
            },
            method: 'DELETE',
            url: `web_api/v1/invites/${id}`,
          });
        });
      });
  });
}

describe('Invitation authentication flow', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations');

    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    cy.contains('Send out invitations').should('be.enabled');
    cy.contains('Send out invitations').click();
    cy.get('p.success').should('be.visible');
    cy.logout();
  });

  it('has correct invitations', () => {
    cy.goToLandingPage();
    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations/all');

    cy.contains('jack@johnson.com');
    cy.contains('Jack Johnson');
    cy.contains('John Jackson');

    cy.logout();
  });

  it('is possible to create account with invite route + token in url', () => {
    getInvites().then((response) => {
      const invites = response.body.data;
      const inviteWithEmail = invites[0];

      cy.visit(`/invite?token=${inviteWithEmail.attributes.token}`);

      cy.get('#e2e-sign-up-email-password-container');
      cy.get('#firstName').should('have.value', 'Jack');
      cy.get('#lastName').should('have.value', 'Johnson');
      cy.get('#email').should('have.value', 'jack@johnson.com');

      const password = randomString();
      cy.get('#password').type(password).should('have.value', password);

      cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
      cy.get('#e2e-signup-password-submit-button').click();

      cy.get('#e2e-success-continue-button').click();
      cy.logout();
    });
  });

  it('is possible to create an account if invitee does not have email', () => {
    getInvites().then((response) => {
      const invites = response.body.data;
      const inviteWithoutEmail = invites[1];

      cy.visit('/invite');

      cy.get('input#token').type(inviteWithoutEmail.attributes.token);
      cy.get('#e2e-invite-submit-button').click();

      cy.get('#e2e-sign-up-email-password-container');
      cy.get('#firstName').should('have.value', 'John');
      cy.get('#lastName').should('have.value', 'Jackson');
      cy.get('#email').should('be.empty');

      const email = randomEmail();
      const password = randomString();

      cy.get('#email').type(email).should('have.value', email);
      cy.get('#password').type(password).should('have.value', password);

      cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
      cy.get('#e2e-signup-password-submit-button').click();

      cy.get('#e2e-success-continue-button').click();
      cy.logout();
    });
  });

  after(() => {
    deleteInvites();
  });
});
