describe('nav bar', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  function assertCorrectReturnToLandingPage() {
    // Navigate back to landing page
    cy.get('li[data-testid="desktop-navbar-item"]').first().click();

    // Assert we're back on the landing page
    cy.url().should('not.include', '/en/projects');
    cy.url().should('include', '/en/');
    cy.get('#e2e-landing-page');
  }

  it('navigates to project from All projects dropdown and back', () => {
    // Navigate to project page
    cy.get('.e2e-projects-dropdown-link').click();
    cy.get('#e2e-projects-dropdown-content > a').first().click();

    // Assert we're on project page
    cy.url().should('include', '/en/projects');
    cy.get('#e2e-project-page');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to projects overview page from All projects dropdown and back', () => {
    // Navigate to projects overview page
    cy.get('.e2e-projects-dropdown-link').click();
    cy.get('#e2e-all-projects-link').click();

    // Assert we're on projects overview page
    cy.url().should('include', '/en/projects');
    cy.get('#e2e-projects-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to All input and back', () => {
    // Navigate to all input page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/ideas"]'
    ).click();

    // Assert we're on the all input page
    cy.url().should('include', '/en/ideas');
    cy.get('#e2e-ideas-container');
  });

  it('navigates to Proposals and back', () => {
    // Navigate to proposals page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/initiatives"]'
    ).click();

    // Assert we're on the proposals page
    cy.url().should('include', '/en/initiatives');
    cy.get('#e2e-initiatives-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to Events and back', () => {
    // Navigate to events page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/events"]'
    ).click();

    // Assert we're on the events page
    cy.url().should('include', '/en/events');
    cy.get('#e2e-events-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to About page', () => {
    // Navigate to about page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/pages/information"]'
    ).click();

    // Assert we're on the about page
    cy.url().should('include', '/en/pages/information');
    cy.get('.e2e-page-information');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to FAQ page', () => {
    // Navigate to faq page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/pages/faq"]'
    ).click();

    // Assert we're on the faq page
    cy.url().should('include', '/en/pages/faq');
    cy.get('.e2e-page-faq');

    assertCorrectReturnToLandingPage();
  });
});
