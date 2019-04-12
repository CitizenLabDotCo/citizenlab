import { isString, get } from 'lodash-es';

before(() => {
  cy.login('admin@citizenlab.co', 'testtest');
  cy.visit('/admin/ideas/');
});

describe('Assignee filter', () => {
  it('Filters on All ideas', () => {
    // grab and open assignee filter menu
    cy.get('#idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('.item').contains('All ideas').click();
    // check that number of ideas on first page is 10
    cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
  });
});

describe('Need feedback toggle', () => {

});

describe('Idea preview ', () => {

});

describe('Idea preview ', () => {

});
