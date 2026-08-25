import React from 'react';

import { SerializedNodes } from '@craftjs/core';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import CustomPageBuilderPage from './CustomPageBuilderPage';

const EDITED_NODES = {
  ROOT: {
    type: { resolvedName: 'CustomPageRoot' },
    isCanvas: true,
    props: {},
    displayName: 'CustomPageRoot',
    custom: { region: true },
    hidden: false,
    nodes: ['CUSTOM_PAGE_BODY'],
    linkedNodes: {},
  },
  CUSTOM_PAGE_BODY: {
    type: { resolvedName: 'CustomPageBody' },
    nodes: ['txt'],
    props: {},
    custom: { region: true },
    hidden: false,
    parent: 'ROOT',
    isCanvas: true,
    displayName: 'CustomPageBody',
    linkedNodes: {},
  },
  txt: {
    type: { resolvedName: 'TextMultiloc' },
    nodes: [],
    props: { text: { en: '<p>Edited</p>' } },
    custom: {},
    hidden: false,
    parent: 'CUSTOM_PAGE_BODY',
    isCanvas: false,
    displayName: 'TextMultiloc',
    linkedNodes: {},
  },
} as unknown as SerializedNodes;

jest.mock('components/CustomPageBuilder/TopBar', () => ({
  __esModule: true,
  default: ({ onSave }: { onSave: (nodes: SerializedNodes) => void }) => (
    <button data-testid="mockSaveButton" onClick={() => onSave(EDITED_NODES)}>
      save
    </button>
  ),
}));
jest.mock('components/CustomPageBuilder/Toolbox', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/CustomPageBuilder/EditModePreview', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/DescriptionBuilder/DescriptionBuilderContent', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/DescriptionBuilder/Settings', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/CustomPageBuilder/Editor', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('components/admin/ContentBuilder/FullscreenContentBuilder', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useLocation: () => ({
    pathname: '/en/admin/custom-page-builder/pages/page-1',
  }),
}));

const mockUpsertCustomPageLayout = jest.fn(() => Promise.resolve());
jest.mock('api/custom_page_layout/useUpsertCustomPageLayout', () =>
  jest.fn(() => ({ mutateAsync: mockUpsertCustomPageLayout }))
);

jest.mock('api/custom_page_layout/useCustomPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      data: {
        id: 'page-layout-1',
        attributes: { enabled: true, craftjs_json: { ROOT: {} } },
      },
    },
  })),
}));

const defaultProps: React.ComponentProps<typeof CustomPageBuilderPage> = {
  staticPageId: 'page-1',
  backPath: '/admin/pages-menu/pages/page-1/content',
  previewLink: { to: '/pages/$slug', params: { slug: 'about-us' } },
  titleMultiloc: { en: 'About us' },
};

describe('CustomPageBuilderPage save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // One-step save: custom pages have no widgets writing back to the page record yet, so
  // there are no drafts to commit before the layout. The banner and title widgets make this
  // a two-step commit; this assertion should fail then.
  it('saves the layout directly, with no page-attribute commit', async () => {
    render(<CustomPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertCustomPageLayout).toHaveBeenCalled());

    expect(mockUpsertCustomPageLayout).toHaveBeenCalledWith({
      staticPageId: 'page-1',
      craftjs_json: EDITED_NODES,
    });
  });
});
