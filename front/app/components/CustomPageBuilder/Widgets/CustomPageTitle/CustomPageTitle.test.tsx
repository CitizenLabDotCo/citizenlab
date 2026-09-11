import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomPageTitle from '.';

let page: unknown = {
  data: { id: 'page-1', attributes: { title_multiloc: { en: 'About us' } } },
};
jest.mock('api/custom_pages/useCustomPageById', () => ({
  __esModule: true,
  default: () => ({ data: page }),
}));
jest.mock('../../useWidgetCustomPageId', () => ({
  __esModule: true,
  default: () => 'page-1',
}));
// useCraftComponentDefaultPadding resolves the widget's parent, the body region.
let mockInBuilder = true;
jest.mock('@craftjs/core', () => ({
  ROOT_NODE: 'ROOT',
  useNode: (collect?: (node: { data: unknown }) => unknown) => ({
    ...(collect
      ? (collect({ data: { parent: 'CUSTOM_PAGE_BODY', props: {} } }) as object)
      : {}),
    actions: { setProp: jest.fn() },
  }),
  // useCraftComponentDefaultPadding calls this with no collector; the widget passes one.
  useEditor: (
    collect?: (state: { options: { enabled: boolean } }) => object
  ) => ({
    query: {
      node: () => ({
        get: () => ({ data: { displayName: 'CustomPageBody' } }),
      }),
    },
    ...(collect ? collect({ options: { enabled: mockInBuilder } }) : {}),
  }),
}));

describe('CustomPageTitle', () => {
  beforeEach(() => {
    mockInBuilder = true;
    page = {
      data: {
        id: 'page-1',
        attributes: { title_multiloc: { en: 'About us' } },
      },
    };
  });

  // The draft is what the settings panel is editing, so it has to win while unsaved.
  it('prefers an unsaved draft over the stored title', () => {
    render(<CustomPageTitle title={{ en: 'Our team' }} />);

    expect(screen.getByText('Our team')).toBeInTheDocument();
    expect(screen.queryByText('About us')).not.toBeInTheDocument();
  });

  // An empty heading would leave nothing to click in the builder.
  it('falls back to a placeholder when the page has no title', () => {
    page = { data: { id: 'page-1', attributes: { title_multiloc: {} } } };

    render(<CustomPageTitle />);

    expect(screen.getByText('Untitled page')).toBeInTheDocument();
  });
});
