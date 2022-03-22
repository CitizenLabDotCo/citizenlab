import { randomString } from '../support/commands';

describe('Idea cards without filter sidebar sorting and filtering', () => {
  const ideaTitle = randomString();
  const ideaContent = randomString();
  let projectId: string;
  let ideaId: string;

  before(() => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council')
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
      });
  });

  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-ideas-container');
    cy.wait(1000);
  });

  it('lets you search the ideas', () => {
    cy.get('.e2e-search-input input').type(ideaTitle);
    cy.wait(1000);
    cy.get('.e2e-search-input input').should('have.value', ideaTitle);
    cy.get('#e2e-ideas-list');
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .should('have.length', 1)
      .contains(ideaTitle);
  });

  it('lets you sort the ideas', () => {
    // sort by newest first
    cy.get('#e2e-ideas-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains(ideaTitle);

    // sort by most voted
    cy.get('#e2e-ideas-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-popular').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card')
      .first()
      .contains('Repellendus reprehenderit quae voluptas quia.');

    // sort by oldest first
    cy.get('#e2e-ideas-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-old').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains('Very Old Idea');
  });

  it('lets you filter the ideas by topic', () => {
    cy.get('#e2e-idea-filter-selector').click();
    cy.get('.e2e-sort-items').contains('waste').click();
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .should('have.length', 1)
      .contains('The idea about waste');
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
  });
});

describe('Idea cards without filter sidebar pagination', () => {
  it('lets you load more ideas', () => {
    cy.visit('/ideas');
    cy.get('#e2e-idea-cards-show-more-button').click();
    cy.get('#e2e-ideas-list');
    cy.wait(4000);
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .its('length')
      .should('be.gte', 24);
  });
});
