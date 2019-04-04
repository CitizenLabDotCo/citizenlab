import { randomString } from '../support/commands';

describe('IdeaCards component', () => {
  it('has a functional search field', () => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId  = project.body.data.id;
      const ideaTitle = randomString();
      const ideaContent = randomString();

      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

      cy.visit('/ideas');

      // type ideaTitle in search field and check if it's actually there
      cy.get('#e2e-ideas-search').type(ideaTitle).should('have.value', ideaTitle);

      // there should only be this idea (ideaTitle), which we double check (length + content)
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains(ideaTitle);
    });
  });

  it('lets you sort the ideas by newest and oldest first', () => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId  = project.body.data.id;
      const ideaTitle = randomString();
      const ideaContent = randomString();

      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

      cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');

      // sort by newest first
      cy.get('#e2e-ideas-sort-filter ').click();
      cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();
      cy.wait(1000);

      // find first idea card
      cy.get('#e2e-ideas-list');
      cy.get('.e2e-idea-card').first().contains(ideaTitle);

      // sort by oldest first
      cy.get('#e2e-ideas-sort-filter ').click();
      cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-old').click();
      cy.wait(1000);

      // find first idea card
      cy.get('#e2e-ideas-list');
      cy.get('.e2e-idea-card').first().contains('Very Old Idea');
    });
  });

  it('lets you filter the ideas by topic', () => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
    cy.get('#e2e-idea-filter-selector').click();
    cy.get('.e2e-filter-selector-dropdown-list').contains('waste').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains('The idea about waste');
  });

});
