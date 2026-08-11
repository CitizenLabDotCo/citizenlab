const deleteAllInvites = () =>
  cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${response.body.jwt}`,
    };

    cy.request({ headers, method: 'GET', url: 'web_api/v1/invites' }).then(
      ({ body }) => {
        body.data.forEach(({ id }: { id: string }) => {
          cy.request({
            headers,
            method: 'DELETE',
            url: `web_api/v1/invites/${id}`,
            // Deleting an invite destroys the invited user, which can collide
            // with the invitation email still being processed for them. This is
            // tidying up, not the thing under test, so it must not fail the run.
            failOnStatusCode: false,
          });
        });
      }
    );
  });

describe('Admin: invitations form', () => {
  beforeEach(() => {
    deleteAllInvites();
    cy.setAdminLoginCookie();
    cy.visit('/admin/users/invitations');
  });

  after(() => {
    deleteAllInvites();
  });

  // Inviting runs as two background jobs — count the seats, then create — so the
  // form waits on polling rather than on the response to the submit.
  it('resets the form once the invites have been created', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    cy.get('.e2e-submit-wrapper-button').should('not.be.disabled');
    cy.get('.e2e-submit-wrapper-button').click();

    // Long enough for both jobs on a cold queue, short enough that a stall does
    // not read as a pass.
    cy.contains('Invitation successfully sent out.', { timeout: 60000 }).should(
      'be.visible'
    );

    // The form no longer holds the spreadsheet, so the input must stop
    // displaying it. This is the assertion jsdom cannot make: it refuses to put
    // a filename on a file input, so the state under test cannot be set up.
    cy.get('input[type=file]').should('have.value', '');

    cy.visit('/admin/users/invitations/all');
    cy.contains('jack@johnson.com');
  });

  describe('when the invitees would exceed the seat limit', () => {
    // Forces the exceedance instead of depending on the tenant's seat limits,
    // which every run of this spec ratchets upwards. Modifies the real payload
    // rather than replacing it, so nothing else about the page changes.
    const capAdminSeatsAtOne = () =>
      cy
        .intercept('GET', '**/web_api/v1/app_configuration', (req) => {
          req.continue((res) => {
            const core = res.body.data.attributes.settings.core;
            core.maximum_admins_number = 1;
            core.additional_admins_number = 0;
          });
        })
        .as('appConfiguration');

    const submitInviteWithAdminRights = () => {
      cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
      cy.contains('Invitation options').click();
      // The toggle renders a styled div over a deliberately hidden checkbox,
      // and its data-testid only exists in test builds — so click the real
      // control and skip the visibility check.
      cy.contains('Give invitees admin rights')
        .parent()
        .find('input[type=checkbox]')
        .click({ force: true });
      cy.get('.e2e-submit-wrapper-button').click();

      cy.contains('Confirm impact on seat usage', { timeout: 60000 }).should(
        'be.visible'
      );
    };

    beforeEach(() => {
      capAdminSeatsAtOne();
      cy.visit('/admin/users/invitations');
    });

    it('creates nothing when the modal is closed before confirming', () => {
      submitInviteWithAdminRights();

      cy.get('.e2e-modal-close-button').first().click();
      cy.contains('Confirm impact on seat usage').should('not.exist');

      // Declining means declining: the form goes quiet and nothing is sent.
      cy.contains('Sending out invitations. Please wait...').should(
        'not.exist'
      );
      cy.visit('/admin/users/invitations/all');
      cy.contains('jack@johnson.com').should('not.exist');
    });

    // Seat numbers change when invites are created, and the page showing them
    // never refetches on its own — the app sets staleTime to Infinity, so only
    // an explicit invalidation updates them. Without one, an admin inviting
    // twice in a row is deciding against stale numbers.
    it('updates the assigned seats without a reload', () => {
      submitInviteWithAdminRights();

      cy.contains('Assigned seats:')
        .invoke('text')
        .then((before) => {
          cy.contains('Confirm and send out invitations').click();
          cy.contains('Invitation successfully sent out.', {
            timeout: 60000,
          }).should('be.visible');

          // The spreadsheet adds two admins, so this has to move.
          cy.contains('Assigned seats:')
            .invoke('text')
            .should('not.equal', before);
        });
    });

    // Closing the modal after confirming is not a cancellation — the creation
    // job is already running, and the form has to go on reporting it.
    it('still reports the result when the modal is closed after confirming', () => {
      submitInviteWithAdminRights();

      cy.contains('Confirm and send out invitations').click();
      cy.get('.e2e-modal-close-button').first().click();
      cy.contains('Confirm impact on seat usage').should('not.exist');

      cy.contains('Invitation successfully sent out.', {
        timeout: 60000,
      }).should('be.visible');

      cy.visit('/admin/users/invitations/all');
      cy.contains('jack@johnson.com');
    });
  });
});
