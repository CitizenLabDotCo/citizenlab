declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getDropIndicator(
        indicator: 'error' | 'success',
        indicatorColors?: Record<'error' | 'success', string>
      ): Chainable<Element>;

      dragAndDrop(
        target: string,
        options?: Partial<DropOptions>
      ): Chainable<Element>;

      dragOver(
        target: string,
        options?: Partial<DropOptions>
      ): Chainable<Element>;

      drop(): Chainable<Element>;
    }
  }
}

class DummyDataTransfer {
  data = {};

  dropEffect = 'move';

  effectAllowed = 'all';
  files = [];
  items = [];
  types = [];

  clearData(format) {
    if (format) {
      delete this.data[format];

      const index = this.types.indexOf(format);
      delete this.types[index];
      delete this.data[index];
    } else {
      this.data = {};
    }
  }

  setData(format, data) {
    this.data[format] = data;
    this.items.push(data);
    this.types.push(format);
  }

  getData(format) {
    if (format in this.data) {
      return this.data[format];
    }

    return '';
  }

  setDragImage(img, xOffset, yOffset) {}
}

export const getCoordinatesFromPos = (
  dom: HTMLElement,
  position: DropOptions['position']
) => {
  const { left, top, width, height } = dom.getBoundingClientRect();

  switch (position) {
    case 'right': {
      return {
        x: left + width,
        y: top + height / 2,
      };
    }
    case 'left': {
      return {
        x: left,
        y: top + height / 2,
      };
    }
    case 'above': {
      return {
        x: left + width / 2,
        y: top,
      };
    }
    case 'below': {
      return {
        x: left + width / 2,
        y: top + height,
      };
    }
    case 'inside': {
      return {
        x: left + 10,
        y: top + 10,
      };
    }
    default: {
      return {
        x: 0,
        y: 0,
      };
    }
  }
};

/**
 * Use this command to drag and drop a source component onto/into a target component
 * If you want to drop into a component use { position: 'inside' } as options parameter
 *
 * @example cy.get('source').dragAndDrop('target')
 * @example cy.get('source').dragAndDrop('target-container', { position: 'inside' })
 * @example cy.get('source').dragAndDrop('target', { position: 'bottom' })
 */
Cypress.Commands.add(
  'dragAndDrop',
  {
    prevSubject: true,
  },
  (subject, target, opts: Partial<DropOptions> = { position: 'right' }) => {
    cy.get(subject).dragOver(target, opts);
    cy.get(subject).drop();
  }
);

/**
 * Use this command if you want to drag a source component over a target component.
 * You can use the same positions as in the `dragAndDrop` command.
 * This command is especially useful when you want to verify that the correct drop indicator is rendered.
 * You can use the `drop` command afterwards on the source component to drop the component.
 * If you just want to drag and drop a component, use the `dragAndDrop` command instead.
 *
 * @example ```
 *  cy.get('source').dragOver('target');
 *  cy.getDropIndicator('success').should('exist');
 *  cy.get('source').drop();
 * ```
 */
Cypress.Commands.add(
  'dragOver',
  {
    prevSubject: true,
  },
  (subject, target, opts: Partial<DropOptions> = { position: 'right' }) => {
    const { position } = {
      ...opts,
    };

    cy.get(target).as('target');
    cy.get('@target').then(($target) => {
      const dom = $target[0];
      const { x, y } = getCoordinatesFromPos(dom, position);

      const dataTransfer = new DummyDataTransfer();
      cy.get('@target').parent().as('parent');

      cy.get(subject)
        .trigger('mousedown', { force: true })
        .trigger('dragstart', {
          force: true,
          dataTransfer,
        });

      if (position === 'inside') {
        cy.get('@target').trigger('dragover', {
          clientX: Math.floor(x),
          clientY: Math.floor(y),
          dataTransfer,
          force: true,
        });
      } else {
        cy.get('@parent').trigger('dragover', {
          clientX: Math.floor(x),
          clientY: Math.floor(y),
          dataTransfer,
          force: true,
        });
      }
    });
  }
);
