describe('Landing page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the page', () => {
    cy.get('#e2e-landing-page');
  });

  it('shows the project section', () => {
    cy.get('#e2e-landing-page-project-section');
  });

  describe('Signed out header', () => {
    it('shows the signed-out header when not logged in', () => {
      cy.get('.e2e-signed-out-header');
    });

    it('shows the signed-out header title when not logged in', () => {
      cy.get('.e2e-signed-out-header-title');
    });

    it('shows the signed-out header subtitle when not logged in', () => {
      cy.get('.e2e-signed-out-header-subtitle');
    });

    it('shows the signed-out header CTA button when not logged in, and redirects to /sign-up on click', () => {
      cy.get('.e2e-signed-out-header-cta-button').click();
      cy.location('pathname').should('eq', '/en-GB/sign-up');
    });
  });

  describe('Signed in header', () => {
    it('shows the signed-in header when logged in', () => {
      const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
      const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
      const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@${Math.random().toString(36).substr(2, 12).toLowerCase()}.co`;
      const password = Math.random().toString(36).substr(2, 12).toLowerCase();
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);
      cy.visit('/');
      cy.get('.e2e-signed-in-header');
    });
  });

  it('shows 6 project cards in the correct layout configuration', () => {
    cy.get('.e2e-project-card').should('have.length', 6);
    cy.get('.e2e-project-card').eq(0).should('have.class', 'large');
    cy.get('.e2e-project-card').eq(1).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(2).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(3).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(4).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(5).should('have.class', 'small');
  });

  it('shows a "show more" button underneath the project cards', () => {
    cy.get('.e2e-project-cards-show-more-button');
  });
});
