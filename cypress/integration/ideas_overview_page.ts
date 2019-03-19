import { randomString } from '../support/commands';

describe('Ideas overview page', () => {
  beforeEach(() => {
    cy.visit('/ideas');
  });

  context('Project filter', () => {

    it('filters correctly on 1 project', () => {
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

      cy.get('#e2e-project-filter-selector').click();
      // select project
      cy.get('.e2e-filter-selector-dropdown-list').contains('Ea quas cupiditate tenetur delectus aliquam.').click();
      // contains only ideas from this project, including a specific check to make sure it's not just the number of ideas that's right
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 4).contains('Sint deserunt quis est ut numquam dicta.');
    });

    it('filters correctly on 2 projects', () => {
      cy.get('#e2e-project-filter-selector').click();
      // select first project
      cy.get('.e2e-filter-selector-dropdown-list').contains('Ea quas cupiditate tenetur delectus aliquam.').click();
      // select second project
      cy.get('.e2e-filter-selector-dropdown-list').contains('Sit voluptas sint aliquid quia aut nihil eos').click();
      // contains the number of ideas from the first and second project
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 7);
      // there's an idea from the first project
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains('Sint deserunt quis est ut numquam dicta.');
      // there's an idea from the second project
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains('Quibusdam aut dolorum fugit nisi.');
    });

  });
});
