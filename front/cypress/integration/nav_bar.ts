describe('nav bar', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  function assertCorrectReturnToLandingPage() {
    // Navigate back to landing page
    cy.get('li[data-testid="desktop-navbar-item"]').first().click();

    // Assert we're back on the landing page
    cy.location('pathname').should('eq', '/en/');
    cy.get('#e2e-landing-page');
  }

  it('navigates to project from All projects dropdown and back', () => {
    // Navigate to project page
    cy.get('.e2e-projects-dropdown-link').click();
    cy.get('#e2e-projects-dropdown-content > a')
      .first()
      .invoke('attr', 'href')
      .then(($href) => {
        if (!$href) throw new Error();

        cy.get('#e2e-projects-dropdown-content > a').first().click();

        // Assert we're on project page (using include for when there's a phase parameter)
        cy.location('pathname').should('include', $href);
        cy.get('#e2e-project-page');

        assertCorrectReturnToLandingPage();
      });
  });

  it('navigates to projects overview page from All projects dropdown and back', () => {
    // Navigate to projects overview page
    cy.get('.e2e-projects-dropdown-link').click();
    cy.get('#e2e-all-projects-link').click();

    // Assert we're on projects overview page
    cy.location('pathname').should('eq', '/en/projects');
    cy.get('#e2e-projects-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to All input and back', () => {
    // Navigate to all input page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/ideas"]'
    ).click();

    // Assert we're on the all input page
    cy.location('pathname').should('eq', '/en/ideas');
    cy.get('#e2e-ideas-container');
  });

  it('navigates to Proposals and back', () => {
    // Navigate to proposals page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/initiatives"]'
    ).click();

    // Assert we're on the proposals page
    cy.location('pathname').should('eq', '/en/initiatives');
    cy.get('#e2e-initiatives-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to Events and back', () => {
    // Navigate to events page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/events"]'
    ).click();

    // Assert we're on the events page
    cy.location('pathname').should('eq', '/en/events');
    cy.get('#e2e-events-container');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to About page and back', () => {
    // Navigate to about page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/pages/information"]'
    ).click();

    // Assert we're on the about page
    cy.location('pathname').should('eq', '/en/pages/information');
    cy.get('.e2e-page-information');

    assertCorrectReturnToLandingPage();
  });

  it('navigates to FAQ page and back', () => {
    // Navigate to faq page
    cy.get(
      'li[data-testid="desktop-navbar-item"] > a[href="/en/pages/faq"]'
    ).click();

    // Assert we're on the faq page
    cy.location('pathname').should('eq', '/en/pages/faq');
    cy.get('.e2e-page-faq');

    assertCorrectReturnToLandingPage();
  });
});

const gotoURL = (baseURL: string, withLocale: boolean) => {
  const URL = `${withLocale ? '/en' : ''}${baseURL}`;
  cy.visit(URL);
};

[true, false].forEach((withLocale) => {
  describe(`direct visits ${
    withLocale ? '(with locale)' : '(without locale)'
  }`, () => {
    it('navigates to project from All projects dropdown', () => {
      cy.goToLandingPage();
      cy.get('.e2e-projects-dropdown-link').click();
      cy.get('#e2e-projects-dropdown-content > a')
        .first()
        .invoke('attr', 'href')
        .then(($href) => {
          if (!$href) throw new Error();

          const href = $href.slice(3, $href.length);

          gotoURL(href, withLocale);

          // Assert we're on project page (using include for when there's a phase parameter)
          cy.location('pathname').should('include', href);
          cy.get('#e2e-project-page');
        });
    });

    it('navigates to projects overview page from All projects dropdown', () => {
      gotoURL('/projects', withLocale);

      // Assert we're on projects overview page
      cy.location('pathname').should('eq', '/en/projects');
      cy.get('#e2e-projects-container');
    });

    it('navigates to All input', () => {
      gotoURL('/ideas', withLocale);

      // Assert we're on the all input page
      cy.location('pathname').should('eq', '/en/ideas');
      cy.get('#e2e-ideas-container');
    });

    it('navigates to Proposals', () => {
      gotoURL('/initiatives', withLocale);

      // Assert we're on the proposals page
      cy.location('pathname').should('eq', '/en/initiatives');
      cy.get('#e2e-initiatives-container');
    });

    it('navigates to Events', () => {
      gotoURL('/events', withLocale);

      // Assert we're on the events page
      cy.location('pathname').should('eq', '/en/events');
      cy.get('#e2e-events-container');
    });

    it('navigates to About page', () => {
      gotoURL('/pages/information', withLocale);

      // Assert we're on the about page
      cy.location('pathname').should('eq', '/en/pages/information');
      cy.get('.e2e-page-information');
    });

    it('navigates to FAQ page', () => {
      gotoURL('/pages/faq', withLocale);

      // Assert we're on the faq page
      cy.location('pathname').should('eq', '/en/pages/faq');
      cy.get('.e2e-page-faq');
    });
  });
});
