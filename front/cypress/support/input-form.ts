/**
 * Clicks the next or submit button of an input form page.
 *
 * The button is disabled until the page's last question is in view, and a
 * click on the disabled button does nothing.
 *
 * @example cy.clickInputFormPageButton('e2e-next-page')
 */
Cypress.Commands.add(
  'clickInputFormPageButton',
  (dataCy: 'e2e-next-page' | 'e2e-submit-form') => {
    cy.get('[data-question-id]').last().scrollIntoView();
    cy.dataCy(dataCy).should('be.visible').should('not.have.class', 'disabled');
    cy.dataCy(dataCy).click();
  }
);
