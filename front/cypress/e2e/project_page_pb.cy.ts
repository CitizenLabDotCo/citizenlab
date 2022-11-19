import { randomString } from '../support/commands';

describe('Continuous PB project', () => {
  before(() => {
    cy.visit('/projects/participatory-budgeting');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the PB expenses box', () => {
    cy.get('.e2e-pb-expenses-box');
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
  });
});
