import { randomString, randomEmail } from '../support/commands';

describe('router history', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-project-page');
    cy.acceptCookies();
    cy.location('pathname').should(
      'eq',
      '/en/projects/an-idea-bring-it-to-your-council'
    );
  });

  it('works with nested routes (show idea)', () => {
    // Get first idea
    cy.get('#e2e-ideas-list > a')
      .first()
      .invoke('attr', 'href')
      .then(($href) => {
        if (!$href) throw new Error();
        const path = $href.split('?')[0];

        // Click on idea
        cy.get('#e2e-ideas-list > a').first().click();
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
