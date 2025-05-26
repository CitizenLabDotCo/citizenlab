const PAGES = [
  { url: 'ideas', container: '#e2e-ideas-container' },
  { url: 'events', container: '#e2e-events-container' },
  { url: 'pages/information', container: '.e2e-page-information' },
  { url: 'pages/faq', container: '.e2e-page-faq' },
];

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
    cy.intercept('GET', '**/web_api/v1/admin_publications**').as(
      'getAdminPublications'
    );

    // Navigate to project page
    cy.get('.e2e-projects-dropdown-link').click();
    cy.wait('@getAdminPublications', { timeout: 10000 });
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
    cy.get('.e2e-projects-dropdown-link').should('be.visible').click();
    cy.get('#e2e-all-projects-link', { timeout: 20000 })
      .should('be.visible')
      .click();

    // Assert we're on projects overview page
    cy.location('pathname').should('eq', '/en/projects');
    cy.get('#e2e-projects-container');

    assertCorrectReturnToLandingPage();
  });

  PAGES.forEach(({ url, container }) => {
    it(`navigates to ${url} and back`, () => {
      // Navigate to proposals page
      cy.get(
        `li[data-testid="desktop-navbar-item"] > a[href="/en/${url}"]`
      ).click();

      // Assert we're on the proposals page
      cy.location('pathname').should('eq', `/en/${url}`);
      cy.get(container);

      assertCorrectReturnToLandingPage();
    });
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

    PAGES.forEach(({ url, container }) => {
      it(`navigates to ${url}`, () => {
        gotoURL(`/${url}`, withLocale);

        // Assert we're on the all input page
        cy.location('pathname').should('eq', `/en/${url}`);
        cy.get(container);
      });
    });
  });
});
