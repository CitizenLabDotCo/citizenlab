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
    nodeNames = ['CustomPageRoot', 'CustomPageTitle', 'CustomPageBody'];
  });

  const bannerEntry = (container: HTMLElement) =>
    container.querySelector('#e2e-draggable-custom-page-banner');

  it('offers the banner on a page that has none', () => {
    const { container } = render(<Toolbox />);

    expect(bannerEntry(container)).toBeInTheDocument();
  });

  // Two banners would stack two headers above the page content.
  it('stops offering the banner once the page has one', () => {
    nodeNames = [...nodeNames, 'CustomPageBanner'];

    const { container } = render(<Toolbox />);

    expect(bannerEntry(container)).not.toBeInTheDocument();
  });

  // The title is always present and hidden with a toggle, so it is never offered here.
  it('never offers the title', () => {
    const { container } = render(<Toolbox />);

    expect(
      container.querySelector('#e2e-draggable-custom-page-title')
    ).not.toBeInTheDocument();
  });
});
