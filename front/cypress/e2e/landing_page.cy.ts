describe('Landing page - not signed in', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  it('shows the correct content', () => {
    // shows the page
    cy.get('#e2e-landing-page');

    // shows the project section
    cy.get('#e2e-landing-page-project-section');

    // shows the signed-out header
    cy.get('.e2e-signed-out-header');

    // shows the signed-out header title
    cy.get('.e2e-signed-out-header-title');

    // shows the signed-out header subtitle
    cy.get('.e2e-signed-out-header-subtitle');

    // has only one active tab
    cy.get('.e2e-projects-list.active-tab').should('have.length', 1);

    // shows the signed-out header CTA button, and shows the sign up/in modal when clicked
    cy.get('.e2e-signed-out-header-cta-button').click();
    cy.get('#e2e-sign-up-in-modal');
  });
});
