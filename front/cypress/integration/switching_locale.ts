describe('Locale switcher', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  it('shows the en version of the page by default', () => {
    cy.location('pathname').should('eq', '/en/');
    cy.get('#e2e-navbar-login-menu-item').contains('Log in');
  });

  it('can switch to nl-BE', () => {
    cy.get('.e2e-langage-dropdown-toggle').click();
    cy.get('.e2e-langage-nl-BE').click();
    cy.location('pathname').should('eq', '/nl-BE/');
    cy.get('#e2e-navbar-login-menu-item').contains('Inloggen');
  });

  it('keeps the picked locale', () => {
    cy.get('.e2e-langage-dropdown-toggle').click();
    cy.get('.e2e-langage-nl-BE').click();
    cy.location('pathname').should('eq', '/nl-BE/');
    cy.goToLandingPage();
    cy.location('pathname').should('eq', '/nl-BE/');
    cy.visit('/en/');
    cy.location('pathname').should('eq', '/nl-BE/');
    cy.get('#e2e-navbar-login-menu-item').contains('Inloggen');
  });

  it('gets you to the right locale on sign-up', () => {
    cy.get('.e2e-langage-dropdown-toggle').click();
    cy.get('.e2e-langage-nl-BE').click();
    cy.location('pathname').should('eq', '/nl-BE/');
    cy.login('admin@citizenlab.co', 'democracy2.0');
    cy.location('pathname').should('eq', '/en/');
  });

  it('keeps users locale', () => {
    cy.login('admin@citizenlab.co', 'democracy2.0');
    cy.location('pathname').should('eq', '/en/');
    cy.visit('/projects/omgevingsanalyse-meerjarenplan-een-gefaseerde-aanpak');
    cy.location('pathname').should(
      'eq',
      '/en/projects/omgevingsanalyse-meerjarenplan-een-gefaseerde-aanpak'
    );
    cy.visit(
      '/fr/projects/omgevingsanalyse-meerjarenplan-een-gefaseerde-aanpak'
    );
    cy.location('pathname').should(
      'eq',
      '/en/projects/omgevingsanalyse-meerjarenplan-een-gefaseerde-aanpak'
    );
  });
});
