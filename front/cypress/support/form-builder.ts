/**
 * Drag a toolbox item and drop it into a specific form area using real mouse events.
 *
 * Works with @hello-pangea/dnd's MouseSensor, which ignores HTML5 drag events but
 * listens for mousedown on the drag handle, then mousemove/mouseup on the window.
 * This is the only way to target a specific drop location — the keyboard-based
 * `addItemToFormBuilder` command can't express a destination, so it drops at
 * whatever position @hello-pangea/dnd picks by default.
 *
 * Both arguments are selectors handed to `cy.get()` (so anything that works in
 * `cy.get()` works here — IDs, data attributes, etc.).
 *
 * `toolboxSelector` points at the source draggable in the left-hand toolbox.
 * `targetSelector` points at the destination droppable. Today the only thing
 * we've given a stable selector to is per-page question zones (see the
 * `data-cy={e2e-page-drop-<key>}` on the `Drop` in FormFields). If you ever
 * need to drop into another zone (e.g. the outer pages droppable), add a
 * similar `data-cy` there.
 *
 * @example
 *   // Drop a sentiment scale into the existing "Governance and trust" page
 *   cy.dragToolboxItemTo(
 *     '#toolbox_sentiment_linear_scale',
 *     '[data-cy="e2e-page-drop-page_governance_and_trust"]'
 *   );
 *
 * @example
 *   // Drop a long-answer question into the "Quality of life" page
 *   cy.dragToolboxItemTo(
 *     '#toolbox_multiline_text',
 *     '[data-cy="e2e-page-drop-page_quality_of_life"]'
 *   );
 */
Cypress.Commands.add(
  'dragToolboxItemTo',
  (toolboxSelector: string, targetSelector: string) => {
    cy.get(toolboxSelector)
      .find('[data-rfd-drag-handle-draggable-id]')
      .then(($handle) => {
        const srcRect = $handle[0].getBoundingClientRect();
        const srcX = srcRect.x + srcRect.width / 2;
        const srcY = srcRect.y + srcRect.height / 2;

        // Begin the drag by pressing on the handle.
        cy.wrap($handle).trigger('mousedown', {
          button: 0,
          buttons: 1,
          clientX: srcX,
          clientY: srcY,
          force: true,
        });

        // First mousemove must exceed @hello-pangea/dnd's 5px threshold to
        // actually start the drag. Dispatch on body so listeners attached to
        // window during drag see it.
        cy.get('body').trigger('mousemove', {
          button: 0,
          buttons: 1,
          clientX: srcX + 10,
          clientY: srcY + 10,
          force: true,
        });

        // Bring the target into view before measuring — @hello-pangea/dnd
        // decides the drop location from the pointer's viewport coordinates.
        cy.get(targetSelector).scrollIntoView();

        cy.get(targetSelector).then(($target) => {
          const tgtRect = $target[0].getBoundingClientRect();
          const tgtX = tgtRect.x + tgtRect.width / 2;
          const tgtY = tgtRect.y + tgtRect.height / 2;

          cy.get('body').trigger('mousemove', {
            button: 0,
            buttons: 1,
            clientX: tgtX,
            clientY: tgtY,
            force: true,
          });

          cy.get('body').trigger('mouseup', {
            button: 0,
            buttons: 0,
            clientX: tgtX,
            clientY: tgtY,
            force: true,
          });
        });
      });
  }
);

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

        // Special handling for page element since they get added in the beginning of the list, instead of at the end for some reason
        // We make sure to move it to the end of the list so that existing tests are not affected
        if (toolboxSelector === '#toolbox_page') {
          cy.wait(1000);

          cy.dataCy('e2e-field-row').then(($rows) => {
            // Start at the first row
            cy.wrap($rows.first())
              .parent()
              .parent()
              .focus()
              .type(' ', { force: true });

            if ($rows.length > 1) {
              const downPresses = $rows.length - 2;

              Array.from({ length: downPresses }).forEach(() => {
                cy.focused().type('{downarrow}', { force: true });
              });
            }

            cy.focused().type(' ', { force: true });
          });
        }
      });
    });
});
