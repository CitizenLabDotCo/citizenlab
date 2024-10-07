import { randomString } from '../../../support/commands';

describe('Admin: proposal phase', () => {
  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();
    cy.visit('/admin/projects/all');
    cy.get('[data-cy="e2e-new-project-button"]').click();
    cy.wait(1000);
    cy.get('.e2e-project-general-form');
  });

  it('creates a published project with a proposals phase', () => {
    cy.intercept('POST', '**/projects').as('createProject');
    const projectTitleEN = randomString();
    const projectTitleNLBE = randomString();
    const projectTitleNLNL = randomString();
    const projectTitleFRBE = randomString();

    // Select 'Published' publication status
    cy.get('.e2e-projecstatus-published').click();

    // Type random project titles for these required fields
    cy.get('#project-title').type(projectTitleEN);
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('#project-title').type(projectTitleNLBE);
    cy.get('.e2e-localeswitcher.nl-NL').click();
    cy.get('#project-title').type(projectTitleNLNL);
    cy.get('.e2e-localeswitcher.fr-BE').click();
    cy.get('#project-title').type(projectTitleFRBE);

    // Submit project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.wait('@createProject');
    cy.wait(2000);

    // Create a proposals phase
    const phaseNameEN = randomString();
    cy.get('#title').type(phaseNameEN);

    // Set date
    cy.get('.e2e-date-phase-picker-input').first().click();
    cy.get('.rdp-today').first().click();

    // Click input again to close date picker
    cy.get('.e2e-date-phase-picker-input').first().click();

    cy.get('#e2e-participation-method-choice-proposals').click();
    cy.get('.e2e-submit-wrapper-button button').click();

    cy.url().should('include', '/proposals'); // Redirected to input manager

    cy.get('#e2e-projects-admin-container').should(
      'contain.text',
      'Proposals phase'
    );

    cy.get('#e2e-view-project').click();

    // Verify proposal phase is created and published
    cy.get('#e2e-project-page').should('contain.text', projectTitleEN);
    cy.get('#e2e-ideation-cta-button').should(
      'have.text',
      'Submit your idea' // Change to proposal later
    );
  });
});
