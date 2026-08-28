import React from 'react';

import { render } from 'utils/testUtils/rtl';

import Toolbox from '.';

let nodeNames: string[] = [];
// DraggableElement calls useEditor() with no collector for its drag connectors, so the mock
// has to serve both shapes.
jest.mock('@craftjs/core', () => ({
  useEditor: (collect?: (state: { nodes: unknown }) => object) => {
    const editor = {
      connectors: { create: jest.fn() },
      actions: { selectNode: jest.fn() },
    };
    if (!collect) return editor;
    return {
      ...editor,
      ...collect({
        nodes: Object.fromEntries(
          nodeNames.map((name, index) => [index, { data: { name } }])
        ),
      }),
    };
  },
}));

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

describe('CustomPageBuilderToolbox', () => {
  beforeEach(() => {
    nodeNames = ['CustomPageRoot', 'CustomPageBody'];
  });

  const titleEntry = (container: HTMLElement) =>
    container.querySelector('#e2e-draggable-custom-page-title');

  it('offers the title on a page that has none', () => {
    const { container } = render(<Toolbox />);

    expect(titleEntry(container)).toBeInTheDocument();
  });

  // Two titles would render the page heading twice, and the placed one is already editable.
  it('stops offering the title once the page has one', () => {
    nodeNames = ['CustomPageRoot', 'CustomPageTitle', 'CustomPageBody'];

    const { container } = render(<Toolbox />);

    expect(titleEntry(container)).not.toBeInTheDocument();
  });
});
