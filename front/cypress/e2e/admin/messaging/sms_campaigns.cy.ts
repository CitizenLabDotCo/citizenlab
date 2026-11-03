import { randomString } from '../../../support/commands';

const subjectField = {
  container: '.e2e-sms-campaign_subject_multiloc',
  input: 'input',
};
const bodyField = {
  container: '.e2e-sms-campaign_body_multiloc',
  input: 'textarea',
};

describe('Admin: SMS campaigns', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('shows the SMS tab and the remaining credits', () => {
    cy.visit('/admin/messaging/sms');
    cy.contains('SMS credits remaining').should('exist');
  });

  // One campaign, walked through every action an admin can take on it. The steps
  // mutate the same draft, so they belong in one test rather than in separate ones
  // that would only pass in the right order.
  it('walks a campaign through create, edit, preview and delete', () => {
    const subject = randomString();
    const body = randomString();
    const editedSubject = randomString();

    // Create
    cy.visit('/admin/messaging/sms/new');
    cy.clickLocaleSwitcherAndType(subject, subjectField);
    cy.clickLocaleSwitcherAndType(body, bodyField);
    cy.get('#e2e-sms-campaign-form-save-button').click();

    cy.location('pathname').should('match', /\/admin\/messaging\/sms\/[\w-]+$/);
    cy.contains(subject).should('exist');
    cy.contains(body).should('exist');
    cy.contains('Draft').should('exist');

    // Listed alongside the other campaigns. The row's title is not a link — Manage is.
    cy.visit('/admin/messaging/sms');
    cy.contains('.e2e-admin-list-row', subject).contains('Manage').click();
    cy.location('pathname').should('match', /\/admin\/messaging\/sms\/[\w-]+$/);

    // Edit. Asserted without reloading in between, so a cached campaign would show up
    // as the old subject still being on screen.
    cy.dataCy('e2e-sms-edit-button').click();
    cy.clickLocaleSwitcherAndType(editedSubject, subjectField);
    cy.get('#e2e-sms-campaign-form-save-button').click();

    cy.location('pathname').should('match', /\/admin\/messaging\/sms\/[\w-]+$/);
    cy.contains(editedSubject).should('exist');
    cy.contains(subject).should('not.exist');

    // The preview goes to the sender's own phone, and the seeded admin has never
    // confirmed one, so the button has to stay out of reach.
    cy.dataCy('e2e-send-sms-preview-button').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
    cy.dataCy('e2e-send-sms-preview-button').trigger('mouseenter');
    cy.contains('Add a phone number to your').should('exist');
    cy.contains('a', 'profile').should(
      'have.attr',
      'href',
      '/en/profile/change-phone'
    );

    // What a send would reach. The template seeds phone-confirmed users but no SMS
    // consents, and this campaign is opt-in, so the send is correctly refused.
    cy.dataCy('e2e-sms-send-button').click();
    cy.contains('Recipients').should('exist');
    cy.contains('Credits remaining').should('exist');
    cy.contains('Nobody matches this message right now').should('exist');
    cy.dataCy('e2e-sms-send-confirm-button').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
    cy.contains('Change recipients').click();

    // Delete
    cy.dataCy('e2e-sms-delete-button').click();
    cy.dataCy('e2e-sms-delete-confirm-button').click();

    cy.location('pathname').should('eq', '/en/admin/messaging/sms');
    cy.contains(editedSubject).should('not.exist');
  });
});
