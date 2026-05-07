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

// Cached once per spec — re-authenticating on every helper / poll iteration
// was the dominant source of CI slowness on this file.
let authHeaders: { 'Content-Type': string; Authorization: string };

function listInvitesWithEmail(): Cypress.Chainable<EnrichedInvite[]> {
  return cy
    .request({
      headers: authHeaders,
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
    });
}

function deleteInvites() {
  return listInvitesWithEmail().then((entries) => {
    entries.forEach(({ invite }) => {
      cy.request({
        headers: authHeaders,
        method: 'DELETE',
        url: `web_api/v1/invites/${invite.id}`,
      });
    });
  });
}

function deleteUserByEmail(email: string) {
  return cy
    .request({
      headers: authHeaders,
      method: 'GET',
      url: `web_api/v1/users?search=${encodeURIComponent(email)}`,
    })
    .then((res) => {
      const match = (
        res.body.data as Array<{
          id: string;
          attributes: { email: string | null };
        }>
      ).find((u) => u.attributes.email === email);
      if (match) {
        cy.request({
          headers: authHeaders,
          method: 'DELETE',
          url: `web_api/v1/users/${match.id}`,
        });
      }
    });
}

// Poll the bulk-create import job directly until completed_at is set.
// Bounded by `attemptsLeft` so the test fails fast if the job stalls in CI,
// instead of hanging on an open-ended cy.wait. Stays inside Cypress's
// command queue (no native Promise / setTimeout).
function waitForImportJobComplete(
  importId: string,
  attemptsLeft = 60
): Cypress.Chainable {
  return cy
    .request({
      headers: authHeaders,
      method: 'GET',
      url: `web_api/v1/invites_imports/${importId}`,
    })
    .then((res) => {
      if (res.body?.data?.attributes?.completed_at) {
        return cy.wrap(null);
      }
      if (attemptsLeft <= 0) {
        throw new Error(
          `Import job ${importId} did not complete within the polling budget`
        );
      }
      cy.log(`waiting for import ${importId} (${attemptsLeft} attempts left)`);
      return cy
        .wait(2000)
        .then(() => waitForImportJobComplete(importId, attemptsLeft - 1));
    });
}

// Seed invites directly via the bulk_create_xlsx endpoint, bypassing the UI.
// Used by the token-based signup tests so they don't depend on the UI test.
function seedInvitesViaXlsxApi(): Cypress.Chainable<EnrichedInvite[]> {
  return cy.fixture('invites.xlsx', 'base64').then((base64) =>
    cy
      .request({
        headers: authHeaders,
        method: 'POST',
        url: 'web_api/v1/invites_imports/bulk_create_xlsx',
        body: {
          invites: {
            xlsx: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
            locale: 'en',
          },
        },
      })
      .then((res) => {
        const importId = res.body?.data?.id;
        expect(importId, 'seed import id').to.be.a('string');
        return waitForImportJobComplete(importId).then(() =>
          listInvitesWithEmail()
        );
      })
  );
}

describe('Invitation authentication flow', () => {
  // Authenticate once per spec. Test retries reuse the same JWT — fine since
  // the token's lifetime far exceeds a single spec run.
  before(() => {
    cy.apiLogin(ADMIN_EMAIL, ADMIN_PASSWORD).then(({ body }) => {
      authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${body.jwt}`,
      };
    });
  });

  // Run on every retry so attempts don't inherit each other's state.
  beforeEach(() => {
    deleteUserByEmail(FIXTURE_INVITED_EMAIL);
    deleteInvites();
  });

  it('has correct invitations', () => {
    // The bulk_create POST fires once (after the seat-count phase). Catching
    // it gives us the job id deterministically; we then poll that specific
    // job ourselves rather than relying on the frontend's polling continuing.
    cy.intercept('POST', '**/web_api/v1/invites_imports/bulk_create_xlsx').as(
      'bulkCreate'
    );

    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations');
    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    cy.get('.e2e-submit-wrapper-button').should('not.be.disabled').click();

    cy.wait('@bulkCreate', { timeout: 60000 }).then((interception) => {
      const importId = interception.response?.body?.data?.id;
      expect(importId, 'bulk_create import id').to.be.a('string');
      waitForImportJobComplete(importId);
    });

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
    seedInvitesViaXlsxApi().then((entries) => {
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

    seedInvitesViaXlsxApi().then((entries) => {
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
