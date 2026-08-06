import { randomString, randomEmail } from '../support/commands';

describe('router history', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      cy.apiAddAboutBox(project.body.data.id);
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.intercept('GET', '**/web_api/v1/ideas?*').as('getIdeas');
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-project-page');

    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council'
    );

    // The ideas list is code-split + data-dependent, so it mounts after the page
    // shell. Wait for the ideas request to resolve and the cards to render before
    // any test interacts with them — this is the async load that races in CI.
    cy.wait('@getIdeas');
    cy.get('#e2e-ideas-list a', { timeout: 30000 }).should(
      'have.length.greaterThan',
      0
    );
  });

  it('works with nested routes (show idea)', () => {
    // Get first idea
    cy.get('#e2e-ideas-list a')
      .first()
      .invoke('attr', 'href')
      .then(($href) => {
        if (!$href) throw new Error();
        const path = $href.split('?')[0];

        // Click on idea
        cy.get('#e2e-ideas-list a').first().click();
        cy.location('pathname').should('eq', path);

        // Go back with browser back button
        cy.go('back');
        cy.location('pathname').should(
          'eq',
          '/en/projects/an-idea-bring-it-to-your-council'
        );

        // Go forward with browser forward button
        cy.go('forward');
        cy.location('pathname').should('eq', path);

        // Go back with on-page button
        cy.get('#e2e-go-back-link').click();
        cy.location('pathname').should(
          'eq',
          '/en/projects/an-idea-bring-it-to-your-council'
        );
      });
  });

  it('works with nested routes (idea form)', () => {
    // Go to new idea form
    cy.get('#project-ideabutton').click();
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );

    // Go back with browser back button
    cy.go('back');
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council'
    );

    // Go forward with browser forward button
    cy.go('forward');
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );

    // Navigate back to home page
    cy.goToLandingPage();
    cy.location('pathname').should('eq', '/en/');

    // Go back with browser back button
    cy.go('back');
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council/ideas/new'
    );
  });
});
