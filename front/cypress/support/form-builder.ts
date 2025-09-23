/**
 * Add an item from the toolbox to the form builder using keyboard navigation approach
 * This command replicates the complex keyboard navigation logic for adding form elements
 *
 * @param toolboxSelector - The selector for the toolbox item (e.g., '#toolbox_number')
 * @example cy.addItemToFormBuilder('#toolbox_number')
 */
Cypress.Commands.add('addItemToFormBuilder', (toolboxSelector: string) => {
  cy.get(toolboxSelector)
    .children()
    .then(($subject) => {
      const subjectIndex = $subject.index();
      cy.dataCy('e2e-form-fields').then(($target) => {
        // assuming this is the form area
        const targetIndex = $target.index();
        const difference = targetIndex - subjectIndex;
        const direction = difference > 0 ? '{downarrow}' : '{uparrow}';
        const steps = Math.abs(difference);

        cy.get(toolboxSelector).children().focus().type(' ', { force: true });

        Array.from({ length: steps }).forEach(() => {
          cy.get(toolboxSelector).children().type(direction, { force: true });
        });

        cy.get(toolboxSelector).children().type(' ', { force: true });
      });
    });
});
