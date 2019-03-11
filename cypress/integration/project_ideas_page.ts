import { randomString } from '../support/commands';

describe('Project ideas page', () => {
  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
  });

  it('shows the page', () => {
    cy.get('.e2e-project-ideas-page');
  });

  it('shows where you are', () => {
    cy.get('.e2e-projects-dropdown-link').should('have.class', 'active').should('be.visible');
    cy.get('.e2e-project-ideas-link').should('have.class', 'active').should('be.visible');
  });

  it('shows the list of idea cards', () => {
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

  it('lets you sort the ideas by newest and oldest first', () => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId  = project.body.data.id;
      const ideaTitle = randomString();
      const ideaContent = randomString();

      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
      cy.get('#e2e-ideas-sort-filter ').click();
      cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().contains(ideaTitle);
      cy.get('#e2e-ideas-sort-filter ').click();
      cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-old').click();
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().contains('Very Old Idea');
    });
  });

  it('lets you filter the ideas by topic', () => {
    cy.get('#e2e-idea-filter-selector').click();
    cy.get('.e2e-filter-selector-dropdown-list').contains('waste').click();
    cy.get('#e2e-ideas-container').contains('The idea about waste');
  });

  it('takes you to the idea page when clicking an idea card', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().as('ideaCard');
    cy.get('@ideaCard').then(($a) => {
      const href = $a.prop('href');
      cy.get('@ideaCard').click();
      cy.url().should('eq', href);
    });
  });
});
