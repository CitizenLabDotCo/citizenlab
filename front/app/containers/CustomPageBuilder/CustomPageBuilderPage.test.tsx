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
    nodes: ['CUSTOM_PAGE_TITLE', 'CUSTOM_PAGE_BODY'],
    linkedNodes: {},
  },
  CUSTOM_PAGE_TITLE: {
    type: { resolvedName: 'CustomPageTitle' },
    nodes: [],
    props: { showTitle: true },
    custom: { deletable: false },
    hidden: false,
    parent: 'ROOT',
    isCanvas: false,
    displayName: 'CustomPageTitle',
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

// What the editor hands to save; an example overrides it to simulate a widget's edit.
let mockEditedNodes: SerializedNodes = EDITED_NODES;

jest.mock('components/CustomPageBuilder/TopBar', () => ({
  __esModule: true,
  default: ({ onSave }: { onSave: (nodes: SerializedNodes) => void }) => (
    <button
      data-testid="mockSaveButton"
      onClick={() => onSave(mockEditedNodes)}
    >
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
const mockUpdateCustomPage = jest.fn(() => Promise.resolve());
jest.mock('api/custom_pages/useUpdateCustomPage', () =>
  jest.fn(() => ({ mutateAsync: mockUpdateCustomPage }))
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
    mockEditedNodes = EDITED_NODES;
  });

  // An untouched title widget must not send the page an update on every save.
  it('saves the layout directly when no widget edited the page', async () => {
    render(<CustomPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertCustomPageLayout).toHaveBeenCalled());

    expect(mockUpdateCustomPage).not.toHaveBeenCalled();
    expect(mockUpsertCustomPageLayout).toHaveBeenCalledWith({
      staticPageId: 'page-1',
      craftjs_json: EDITED_NODES,
    });
  });

  // The title lives on the page record, so the draft is committed there and never stored
  // in the layout, where it would go stale on the next rename.
  it('commits an edited title to the page, then stores the layout without it', async () => {
    mockEditedNodes = {
      ...EDITED_NODES,
      CUSTOM_PAGE_TITLE: {
        ...EDITED_NODES.CUSTOM_PAGE_TITLE,
        props: { showTitle: true, title: { en: 'Our team' } },
      },
    };

    render(<CustomPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertCustomPageLayout).toHaveBeenCalled());

    expect(mockUpdateCustomPage).toHaveBeenCalledWith({
      id: 'page-1',
      title_multiloc: { en: 'Our team' },
    });
    expect(mockUpsertCustomPageLayout).toHaveBeenCalledWith({
      staticPageId: 'page-1',
      craftjs_json: EDITED_NODES,
    });
  });
});
