import { randomString } from '../support/commands';

describe('InitiativeCards without filter sidebar component', () => {
  const initiativeTitle = randomString();
  const initiativeContent = Math.random().toString(36);
  let initiativeId: string;

  before(() => {
    cy.apiCreateInitiative(initiativeTitle, initiativeContent).then((initiative) => {
      initiativeId = initiative.body.data.id;
    });
  });

  beforeEach(() => {
    cy.visit('/initiatives');
    cy.get('#e2e-initiatives-list');
  });

  it('lets you search the initiatives', () => {
    cy.get('.e2e-search-input').type(initiativeTitle);
    cy.wait(1000);
    cy.get('.e2e-search-input').should('have.value', initiativeTitle);
    cy.get('#e2e-initiatives-list');
    cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').should('have.length', 1).contains(initiativeTitle);
  });

  // it('lets you load more initiatives', () => {
  //   cy.get('#e2e-initiative-cards-show-more-button').click();
  //   cy.wait(1000);
  //   cy.get('#e2e-initiatives-list').find('.e2e-initiative-card').its('length').should('be.gte', 12);
  // });

  it('lets you sort the initiatives', () => {
    // sort by newest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
    cy.wait(1000);
    cy.get('#e2e-initiatives-list');
    cy.get('.e2e-initiative-card').first().contains(initiativeTitle);

    // sort by oldest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-old').click();
    cy.wait(1000);
    cy.get('#e2e-initiatives-list');
    cy.get('.e2e-initiative-card').first().contains('Planting flowers');
  });

  it('lets you filter the initiatives by topic', () => {
    cy.get('#e2e-initiative-filter-selector').click();
    cy.get('.e2e-sort-items').contains('waste').click();
    cy.get('#e2e-initiatives-container').find('.e2e-initiative-card').should('have.length', 1).contains('The initiative about waste');
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId);
  });

});
