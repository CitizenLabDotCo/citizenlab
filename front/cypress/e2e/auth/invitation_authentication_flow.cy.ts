import { randomString, randomEmail } from '../../support/commands';

function getInvites() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'GET',
      url: 'web_api/v1/invites',
    });
  });
}

function deleteInvites() {
  return cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const adminJwt = response.body.jwt;

    return cy
      .request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'GET',
        url: 'web_api/v1/invites',
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
    deleteInvites();
  });

  it('has correct invitations', () => {
    cy.intercept('POST', '**/invites/*').as('postInvitesRequest');
    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations');
    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    cy.wait(1000); // wait for the button to become enabled after file selection
    cy.get('.e2e-submit-wrapper-button').click();
    cy.wait('@postInvitesRequest');
    cy.get('.e2e-submit-wrapper-button').contains('Success');
    cy.visit('/admin/users/invitations/all');
    cy.contains('jack@johnson.com');
    cy.contains('Jack Johnson');
    cy.contains('John Jackson');
    cy.logout();
  });

  // TODO: remove user after this test
  it('is possible to create an account with invite route + token in url', () => {
    getInvites().then((response) => {
      const invites = response.body.data;
      const inviteWithEmail = invites[1];

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
    });
  });

  // TODO: remove user after this test
  it('is possible to create an account if invitee does not have email', () => {
    getInvites().then((response) => {
      const invites = response.body.data;
      const inviteWithoutEmail = invites[0];

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
    });
  });
});
