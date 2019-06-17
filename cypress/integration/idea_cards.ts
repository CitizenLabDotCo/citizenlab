import { randomString } from '../support/commands';

describe('IdeaCards without filter sidebar component', () => {
  const ideaTitle1 = randomString();
  const ideaContent1 = randomString();
  const ideaTitle2 = randomString();
  const ideaContent2 = randomString();
  let projectId: string;
  let ideaId1: string;
  let ideaId2: string;

  before(() => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      projectId = project.body.data.id;
      return cy.apiCreateIdea(projectId, ideaTitle1, ideaContent1);
    }).then((idea1) => {
      ideaId1 = idea1.body.data.id;
      return cy.apiCreateIdea(projectId, ideaTitle2, ideaContent2);
    }).then((idea2) => {
      ideaId2 = idea2.body.data.id;
    });
  });

  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
    cy.wait(1000);
  });

  it('lets you search the ideas', () => {
    cy.get('.e2e-search-input').type(ideaTitle2);
    cy.wait(1000);
    cy.get('.e2e-search-input').should('have.value', ideaTitle2);
    cy.get('#e2e-ideas-list');
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').should('have.length', 1).contains(ideaTitle2);
  });

  it('lets you load more ideas', () => {
    cy.get('#e2e-idea-cards-show-more-button').click();
    cy.wait(1000);
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').its('length').should('be.gte', 12);
  });

  it('lets you sort the ideas', () => {
    // sort by newest first
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains(ideaTitle2);

    // sort by trending
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-trending').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains(ideaTitle2);

    // sort by most voted
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-popular').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains('Repellendus reprehenderit quae voluptas quia');

    // sort by oldest first
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-old').click();
    cy.wait(1000);

    // find and check first idea card
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card').first().contains('Very Old Idea');
  });

  it('lets you filter the ideas by topic', () => {
    cy.get('#e2e-idea-filter-selector').click();
    cy.get('.e2e-filter-selector-dropdown-list').contains('waste').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains('The idea about waste');
  });

  after(() => {
    cy.apiRemoveIdea(ideaId1);
    cy.apiRemoveIdea(ideaId2);
  });

});
