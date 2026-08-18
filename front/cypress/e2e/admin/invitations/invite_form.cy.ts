/*
 * The invite form waits on two background jobs, and the e2e stack runs no Que
 * worker — so the job responses are stubbed. What is left is what the form does
 * in a real browser as each stage reports back.
 */

const countImportId = 'count-import-id';
const createImportId = 'create-import-id';

// The API renders the import as soon as it is created, so a POST always comes
// back pending — `completed_at` only appears once the job has run.
const pendingImport = (id: string, jobType: string) => ({
  data: {
    id,
    type: 'invites_import',
    attributes: { job_type: jobType, completed_at: null, result: {} },
  },
});

const completedImport = (
  id: string,
  jobType: string,
  result: Record<string, unknown> | unknown[]
) => ({
  data: {
    id,
    type: 'invites_import',
    attributes: {
      job_type: jobType,
      completed_at: '2026-08-11T10:00:00Z',
      result,
    },
  },
});

describe('Admin: invitations form', () => {
  /*
   * The modal appears when `assigned + newly added > maximum + additional`.
   * Stubbing both sides keeps this independent of the tenant's seat limits,
   * which every real run ratchets upwards.
   */
  const stubJobs = ({
    newAdmins,
    onCreate,
  }: {
    newAdmins: number;
    onCreate?: () => void;
  }) => {
    cy.intercept('POST', '**/invites_imports/count_new_seats_xlsx', {
      body: pendingImport(countImportId, 'count_new_seats_xlsx'),
    }).as('countRequest');

    cy.intercept('POST', '**/invites_imports/bulk_create_xlsx', (req) => {
      onCreate?.();
      req.reply({ body: pendingImport(createImportId, 'bulk_create_xlsx') });
    }).as('createRequest');

    cy.intercept('GET', `**/invites_imports/${countImportId}`, {
      body: completedImport(countImportId, 'count_new_seats_xlsx', {
        newly_added_admins_number: newAdmins,
        newly_added_moderators_number: 0,
      }),
    }).as('countPoll');

    cy.intercept('GET', `**/invites_imports/${createImportId}`, {
      body: completedImport(createImportId, 'bulk_create_xlsx', []),
    });
  };

  const stubAssignedAdmins = (readCount: () => number) =>
    cy.intercept('GET', '**/users/seats', (req) => {
      req.reply({
        body: {
          data: {
            type: 'seats',
            attributes: { admins_number: readCount(), moderators_number: 0 },
          },
        },
      });
    });

  // Each stage waits on a 5s poll, so a two-stage flow outlasts the 15s default.
  const JOB_TIMEOUT = { timeout: 30000 };

  const uploadAndSubmit = () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/invites.xlsx');
    // A div with a `disabled` class, so `be.disabled` would pass vacuously and
    // click before the file has been read.
    cy.get('.e2e-submit-wrapper-button')
      .should('not.have.class', 'disabled')
      .click();
    // Fails here if the click did not register.
    cy.contains('Sending out invitations. Please wait...').should('be.visible');
    cy.wait('@countRequest', JOB_TIMEOUT);
  };

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('when the invitees fit within the seat limit', () => {
    beforeEach(() => {
      // No new admins, so no plan can be exceeded.
      stubJobs({ newAdmins: 0 });
      stubAssignedAdmins(() => 1);
      cy.visit('/admin/users/invitations');
    });

    it('creates the invites without asking for confirmation', () => {
      uploadAndSubmit();

      cy.contains('Invitation successfully sent out.', JOB_TIMEOUT).should(
        'be.visible'
      );
      cy.contains('Confirm impact on seat usage').should('not.exist');

      // The form no longer holds the spreadsheet, so the input must stop
      // showing it. jsdom cannot test this: it refuses to put a filename on a
      // file input.
      cy.get('input[type=file]').should('have.value', '');
    });
  });

  describe('when the invitees would exceed the seat limit', () => {
    // Far more admins than any plan the seed data configures.
    const NEW_ADMINS = 500;
    const assignedAdmins = { current: 1 };

    beforeEach(() => {
      assignedAdmins.current = 1;
      stubJobs({
        newAdmins: NEW_ADMINS,
        onCreate: () => (assignedAdmins.current += NEW_ADMINS),
      });
      stubAssignedAdmins(() => assignedAdmins.current);
      cy.visit('/admin/users/invitations');
    });

    const submitAndAwaitConfirmation = () => {
      uploadAndSubmit();
      cy.wait('@countPoll', JOB_TIMEOUT);
      cy.contains('Confirm impact on seat usage').should('be.visible');
    };

    it('creates nothing when the modal is closed before confirming', () => {
      submitAndAwaitConfirmation();

      cy.get('.e2e-modal-close-button').first().click();
      cy.contains('Confirm impact on seat usage').should('not.exist');

      // Declining means declining: the form goes quiet and nothing is sent.
      cy.contains('Sending out invitations. Please wait...').should(
        'not.exist'
      );
      cy.get('@createRequest.all').should('have.length', 0);
    });

    it('updates the assigned seats without a reload', () => {
      // The seat panel is only on the form itself when admin rights are on.
      // Inside the modal it disappears with the confirmation step.
      cy.contains('Invitation options').click();
      cy.contains('Give invitees admin rights')
        .parent()
        .find('input[type=checkbox]')
        .click({ force: true });
      cy.contains('Assigned seats: 1').should('be.visible');

      submitAndAwaitConfirmation();
      cy.contains('Confirm and send out invitations').click();
      cy.contains('Invitation successfully sent out.', JOB_TIMEOUT).should(
        'be.visible'
      );
      cy.get('.e2e-modal-close-button').first().click();

      // Nothing refetches on its own (staleTime is Infinity), so this only
      // moves if the completed job invalidated the seat queries.
      cy.contains(`Assigned seats: ${1 + NEW_ADMINS}`).should('be.visible');
    });

    // Closing the modal after confirming is not a cancellation — the creation
    // job is already running, and the form has to go on reporting it.
    it('still reports the result when the modal is closed after confirming', () => {
      submitAndAwaitConfirmation();

      cy.contains('Confirm and send out invitations').click();
      cy.get('.e2e-modal-close-button').first().click();
      cy.contains('Confirm impact on seat usage').should('not.exist');

      cy.contains('Invitation successfully sent out.', JOB_TIMEOUT).should(
        'be.visible'
      );
    });
  });
});
