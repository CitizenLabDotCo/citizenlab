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
jest.mock('../useWidgetCustomPageId', () => ({
  __esModule: true,
  default: () => 'page-1',
}));
// The widget sits on ROOT, so useCraftComponentDefaultPadding resolves its parent there.
jest.mock('@craftjs/core', () => ({
  ROOT_NODE: 'ROOT',
  useNode: (collect?: (node: { data: unknown }) => unknown) => ({
    ...(collect
      ? (collect({ data: { parent: 'ROOT', props: {} } }) as object)
      : {}),
    actions: { setProp: jest.fn() },
  }),
  useEditor: () => ({
    query: {
      node: () => ({
        get: () => ({ data: { displayName: 'CustomPageRoot' } }),
      }),
    },
  }),
}));

describe('CustomPageTitle', () => {
  beforeEach(() => {
    page = {
      data: {
        id: 'page-1',
        attributes: { title_multiloc: { en: 'About us' } },
      },
    };
  });

  it('renders the page title', () => {
    render(<CustomPageTitle />);

    expect(screen.getByText('About us')).toBeInTheDocument();
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

  it('renders nothing until the page has loaded', () => {
    page = undefined;

    render(<CustomPageTitle />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
