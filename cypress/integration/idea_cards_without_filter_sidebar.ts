import { randomString } from '../support/commands';

describe('IdeaCards without filter sidebar component', () => {

  describe('Search field', () => {
    const ideaTitle = randomString();
    const ideaContent = randomString();
    let ideaId: string;

    before(() => {
      cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
        const projectId  = project.body.data.id;
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      }).then((idea) => {
        ideaId = idea.body.data.id;
        cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
        cy.wait(1000);
      });
    });

    it('has a functional search field', () => {
      cy.get('.e2e-search-input').type(ideaTitle).should('have.value', ideaTitle);
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains(ideaTitle);
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
    });
  });

  describe('Sort dropdown', () => {
    const ideaTitle = randomString();
    const ideaContent = randomString();
    let ideaId: string;

    before(() => {
      cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
        const projectId  = project.body.data.id;
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      }).then((idea) => {
        ideaId = idea.body.data.id;
        cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
        cy.wait(1000);
      });
    });

    it('lets you sort the ideas by newest and oldest first', () => {
        cy.get('#e2e-ideas-sort-filter').click();
        cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();
        cy.wait(1000);

        // find first idea card
        cy.get('#e2e-ideas-list');
        cy.get('.e2e-idea-card').first().contains(ideaTitle);

        // sort by oldest first
        cy.get('#e2e-ideas-sort-filter').click();
        cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-old').click();
        cy.wait(1000);

        // find first idea card
        cy.get('#e2e-ideas-list');
        cy.get('.e2e-idea-card').first().contains('Very Old Idea');
    });

    after(() => {
      cy.apiRemoveIdea(ideaId);
    });
  });

  describe('Topics dropdown', () => {
    before(() => {
      cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
      cy.wait(1000);
    });

    it('lets you filter the ideas by topic', () => {
      cy.get('#e2e-idea-filter-selector').click();
      cy.get('.e2e-filter-selector-dropdown-list').contains('waste').click();
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains('The idea about waste');
    });
  });

});
