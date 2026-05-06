import { randomString, randomEmail } from '../../support/commands';

const ADMIN_EMAIL = 'admin@govocal.com';
const ADMIN_PASSWORD = 'democracy2.0';
const FIXTURE_INVITED_EMAIL = 'jack@johnson.com';

interface Invite {
  id: string;
  attributes: { token: string; [key: string]: unknown };
  relationships: { invitee: { data: { id: string; type: 'user' } } };
}

interface IncludedUser {
  id: string;
  type: 'user';
  attributes: { email: string | null; [key: string]: unknown };
}

interface InvitesResponse {
  data: Invite[];
  included?: Array<{ id: string; type: string; attributes: any }>;
}

type EnrichedInvite = { invite: Invite; email: string | null };

function adminAuthHeader(): Cypress.Chainable<{
  'Content-Type': string;
  Authorization: string;
}> {
  return cy.apiLogin(ADMIN_EMAIL, ADMIN_PASSWORD).then(({ body }) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${body.jwt}`,
  }));
}

// Invite responses don't expose email directly — it lives on the included
// `user` resource. Pair each invite with its invitee email up-front so call
// sites can filter by email without traversing JSON:API on every use.
function listInvitesWithEmail(): Cypress.Chainable<EnrichedInvite[]> {
  return adminAuthHeader().then((headers) =>
    cy
      .request({
        headers,
        method: 'GET',
        url: 'web_api/v1/invites?page[size]=100',
      })
      .then((res) => {
        const body = res.body as InvitesResponse;
        const usersById = new Map<string, IncludedUser>();
        (body.included ?? [])
          .filter((r): r is IncludedUser => r.type === 'user')
          .forEach((u) => usersById.set(u.id, u));
        return body.data.map((invite) => ({
          invite,
          email:
            usersById.get(invite.relationships.invitee.data.id)?.attributes
              .email ?? null,
        }));
      })
  );
}

function deleteInvites() {
  return adminAuthHeader().then((headers) =>
    listInvitesWithEmail().then((entries) => {
      entries.forEach(({ invite }) => {
        cy.request({
          headers,
          method: 'DELETE',
          url: `web_api/v1/invites/${invite.id}`,
        });
      });
    })
  );
}

function deleteUserByEmail(email: string) {
  return adminAuthHeader().then((headers) => {
    cy.request({
      headers,
      method: 'GET',
      url: `web_api/v1/users?search=${encodeURIComponent(email)}`,
    }).then((res) => {
      const match = (
        res.body.data as Array<{
          id: string;
          attributes: { email: string | null };
        }>
      ).find((u) => u.attributes.email === email);
      if (match) {
        cy.request({
          headers,
          method: 'DELETE',
          url: `web_api/v1/users/${match.id}`,
        });
      }
    });
  });
}

// Recursively consume `@invitesImportPoll` matches until the bulk_create
// import job reports completed_at. Mirrors the frontend's importJobComplete
// check and stays inside Cypress's command queue — no native Promise or
// setTimeout, so nothing leaks across tests.
function waitForBulkCreateComplete(): Cypress.Chainable {
  return cy
    .wait('@invitesImportPoll', { timeout: 60000 })
    .then((interception) => {
      const attrs = interception.response?.body?.data?.attributes;
      const isComplete =
        !!attrs?.completed_at &&
        typeof attrs.job_type === 'string' &&
        attrs.job_type.includes('bulk_create');
      return isComplete ? cy.wrap(null) : waitForBulkCreateComplete();
    });
}

describe('Invitation authentication flow', () => {
  // Cleanup inside the test (not a before hook) so retries restart from a
  // clean slate — otherwise duplicate uploads from earlier attempts cascade
  // into later assertions.
  it('has correct invitations', () => {
    // Bulk-create skips an email if a User already has it. A leftover
    // jack@johnson.com from a previous spec run would silently drop the
    // second invite — purge it before uploading.
    deleteUserByEmail(FIXTURE_INVITED_EMAIL);
    deleteInvites();

    cy.intercept('GET', '**/web_api/v1/invites_imports/*').as(
      'invitesImportPoll'
    );

    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations');
    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    // The wrapper has the `disabled` CSS class while selectedFileBase64 is
    // null (file still being read). Once it clears, the form is ready.
    cy.get('.e2e-submit-wrapper-button')
      .should('not.have.class', 'disabled')
      .click();

    waitForBulkCreateComplete();

    // Verify directly against the API — the source of truth — rather than
    // racing the React Query cache on /admin/users/invitations/all.
    listInvitesWithEmail().then((entries) => {
      expect(entries).to.have.length(2);
      const emails = entries.map((e) => e.email);
      expect(emails).to.include(FIXTURE_INVITED_EMAIL);
      expect(emails).to.include(null);
    });
  });

  it('is possible to create an account with invite route + token in url', () => {
    listInvitesWithEmail().then((entries) => {
      const match = entries.find((e) => e.email === FIXTURE_INVITED_EMAIL);
      expect(match, 'invite for jack@johnson.com').to.exist;

      cy.visit(`/invite?token=${match!.invite.attributes.token}`);

      cy.get('#e2e-sign-up-email-password-container');
      cy.get('#firstName').should('have.value', 'Jack');
      cy.get('#lastName').should('have.value', 'Johnson');
      cy.get('#email').should('have.value', FIXTURE_INVITED_EMAIL);

      const password = randomString();
      cy.get('#password').type(password).should('have.value', password);

      cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
      cy.get('#e2e-signup-password-submit-button').click();

      cy.get('#e2e-success-continue-button').click();
    });

    // Cleanup so re-running the spec doesn't collide with the existing user.
    deleteUserByEmail(FIXTURE_INVITED_EMAIL);
  });

  it('is possible to create an account if invitee does not have email', () => {
    const email = randomEmail();

    listInvitesWithEmail().then((entries) => {
      const match = entries.find((e) => e.email === null);
      expect(match, 'invite without email').to.exist;

      cy.visit('/invite');
      cy.get('input#token').type(match!.invite.attributes.token);
      cy.get('#e2e-invite-submit-button').click();

      cy.get('#e2e-sign-up-email-password-container');
      cy.get('#firstName').should('have.value', 'John');
      cy.get('#lastName').should('have.value', 'Jackson');
      cy.get('#email').should('be.empty');

      const password = randomString();
      cy.get('#email').type(email).should('have.value', email);
      cy.get('#password').type(password).should('have.value', password);

      cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
      cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
      cy.get('#e2e-signup-password-submit-button').click();

      cy.get('#e2e-success-continue-button').click();
    });

    deleteUserByEmail(email);
  });
});
