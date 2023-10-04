import { randomString } from '../support/commands';

describe('InitiativeCards without filter sidebar component', () => {
  const initiativeTitle = randomString();
  const initiativeContent = Math.random().toString(36);
  let initiativeId: string;

  before(() => {
    cy.getTopics({ excludeCode: 'custom' })
      .then((topics) => {
        const topicIds = [topics.body.data[0].id];
        return cy.apiCreateInitiative({
          initiativeTitle,
          initiativeContent,
          topicIds,
        });
      })
      .then((initiaitve) => {
        initiativeId = initiaitve.body.data.id;
      });
  });

  beforeEach(() => {
    cy.visit('/initiatives');
    cy.get('#e2e-initiatives-list');
    cy.wait(1000);
  });

  it('lets you search the initiatives', () => {
    cy.get('.e2e-search-input input').type(initiativeTitle);
    cy.wait(1000);
    cy.get('.e2e-search-input input').should('have.value', initiativeTitle);
    cy.get('#e2e-initiatives-list').should('exist');
    cy.get('#e2e-initiatives-list')
      .find('.e2e-initiative-card')
      .should('have.length', 1)
      .contains(initiativeTitle);
  });

  it('lets you sort the initiatives', () => {
    // sort by newest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
    cy.wait(1000);
    cy.get('#e2e-initiatives-list').should('exist');
    cy.get('.e2e-initiative-card').first().contains(initiativeTitle);

    // sort by oldest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-old').click();
    cy.wait(1000);
    cy.get('#e2e-initiatives-list').should('exist');
    cy.get('.e2e-initiative-card').first().contains('Planting flowers');
  });

  it('lets you filter the initiatives by topic', () => {
    cy.get('.e2e-topic').first().click();
    cy.wait(3000);
    cy.get('#e2e-initiatives-list').should('exist');
    cy.get('.e2e-initiative-card').contains(initiativeTitle);
  });

  it('lets you filter the initiatives by status', () => {
    // sort by newest first
    cy.get('#e2e-initiatives-sort-dropdown').click();
    cy.get('.e2e-sort-items').find('.e2e-sort-item-new').click();
    cy.wait(1000);

    // should contain the generated initiative as first card when the status 'Proposed' is selected
    cy.get('.e2e-statuses-filters')
      .find('.e2e-status')
      .contains('Proposed')
      .click();
    cy.wait(1000);
    cy.get('#e2e-initiatives-list').should('exist');
    cy.get('.e2e-initiative-card').first().contains(initiativeTitle);

    // should be empty when the 'Threshold reached' status is selected
    cy.get('.e2e-statuses-filters')
      .find('.e2e-status')
      .contains('Threshold reached')
      .click();
    cy.wait(1000);
    cy.get('.e2e-initiative-cards-empty');
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId);
  });
});
