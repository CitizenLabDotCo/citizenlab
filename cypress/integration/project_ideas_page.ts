describe('Project ideas page', () => {
  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-ideas-page');
  });

  it('shows where you are', () => {
    cy.get('.e2e-projects-dropdown-link').should('have.class', 'active').should('be.visible');
    cy.get('.e2e-project-ideas-link').should('have.class', 'active').should('be.visible');
  });

  it('shows the ideasList', () => {
    cy.get('#e2e-ideas-container');
  });

  it('asks unauthorised users to log in or sign up before they vote', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().find('.upvote.enabled').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-login-button');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-register-button');
  });

  it('takes unauthorised users through signup and back to the page', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().find('.upvote.enabled').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-login-button').click();
    cy.location('pathname').should('eq', '/en-GB/sign-in');
  });

  it('has a functional search field', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length.gt', 3);
    cy.get('#e2e-ideas-search').type('quia sae').should('have.value', 'quia sae');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 3).contains('Quia saepe possimus quo nesciunt');
    cy.get('#e2e-ideas-search').type('pe possimus quo nesciunt').should('have.value', 'quia saepe possimus quo nesciunt');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains('Quia saepe possimus quo nesciunt');
  });

  it('lets you change the ordering of the list', () => {
    cy.get('#e2e-ideas-sort-filter ').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();
    const firstIdea = cy.get('#e2e-ideas-container').find('.e2e-idea-card').first();
    firstIdea.contains('New');
    const lastIdea = cy.get('#e2e-ideas-container').find('.e2e-idea-card').last();
    lastIdea.contains('Old');
    cy.get('#e2e-ideas-sort-filter ').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-old').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().should('be', lastIdea);
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').last().should('be', firstIdea);
  });

  it('lets you filter by topic', () => {
    cy.get('#e2e-idea-filter-selector').click();
    cy.get('.e2e-filter-selector-dropdown-list').contains('waste').click();
    cy.get('#e2e-ideas-container').contains('The idea about waste');
  });

  it('takes you to the idea page when clicking an idea', () => {
    cy.contains('Minus consectetur qui repudiandae voluptates et nulla laboriosam.').click();
    cy.location('pathname').should('eq', '/en-GB/ideas/minus-consectetur-qui-repudiandae-voluptates-et-nulla-laboriosam');
  });
});
