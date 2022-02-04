import { randomString } from '../support/commands';

describe('Project overview page', () => {
  it('show 6 project by default and load more when the show more button is pressed', () => {
    cy.visit('/projects/');
    cy.get('#e2e-projects-container');
    cy.get('#e2e-projects-list');
    cy.acceptCookies();
    const initialCards = cy.get('.e2e-admin-publication-card');
    initialCards.should('have.length', 6);
    cy.get('.e2e-project-cards-show-more-button').click();
    cy.wait(50);
    cy.get('.e2e-project-cards-show-more-button').should(
      'not.have.class',
      'loading'
    );
    const cardsAfterShowMore = cy.get('.e2e-admin-publication-card');
    cardsAfterShowMore.should('have.length.at.least', 7);
  });
});
