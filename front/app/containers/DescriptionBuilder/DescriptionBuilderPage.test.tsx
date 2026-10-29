import React from 'react';

import { SerializedNodes } from '@craftjs/core';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import DescriptionBuilderPage from '.';

const EDITED_NODES = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: { id: 'e2e-content-builder-frame' },
    displayName: 'div',
    custom: {},
    hidden: false,
    nodes: ['txt'],
    linkedNodes: {},
    parent: null,
  },
  txt: {
    type: { resolvedName: 'TextMultiloc' },
    nodes: [],
    props: { text: { en: '<p>Edited</p>' } },
    custom: {},
    hidden: false,
    parent: 'ROOT',
    isCanvas: false,
    displayName: 'TextMultiloc',
    linkedNodes: {},
  },
} satisfies SerializedNodes;

jest.mock('components/DescriptionBuilder/DescriptionBuilderTopBar', () => ({
  __esModule: true,
  default: ({
    onSave,
    saveError,
  }: {
    onSave: (nodes: SerializedNodes) => void;
    saveError: string | null;
  }) => (
    <>
      <button data-testid="mockSaveButton" onClick={() => onSave(EDITED_NODES)}>
        save
      </button>
      <span data-testid="mockSaveError">{saveError}</span>
    </>
  ),
}));
jest.mock(
  'components/DescriptionBuilder/DescriptionBuilderToolbox/FolderDescriptionBuilderToolbox',
  () => ({
    __esModule: true,
    default: () => null,
  })
);
jest.mock('components/DescriptionBuilder/DescriptionBuilderContent', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/DescriptionBuilder/Settings', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  'components/DescriptionBuilder/DescriptionBuilderEditModePreview',
  () => ({
    __esModule: true,
    default: () => null,
  })
);
jest.mock('components/DescriptionBuilder/Editor', () => ({
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
    pathname: '/en/admin/description-builder/folders/folder-1/description',
  }),
}));

const mockAddContentBuilderLayout = jest.fn();
let mockAddLayoutError: unknown = null;
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({
    mutate: mockAddContentBuilderLayout,
    isPending: false,
    error: mockAddLayoutError,
  }))
);

jest.mock('api/content_builder/useContentBuilderLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      data: {
        id: 'folder-layout-1',
        attributes: { enabled: true, craftjs_json: { ROOT: {} } },
      },
    },
  })),
}));

const defaultProps: React.ComponentProps<typeof DescriptionBuilderPage> = {
  contentBuildableId: 'folder-1',
  backPath: '/admin/projects/folders/folder-1/settings',
  previewLink: { to: '/folders/$slug', params: { slug: 'folder-1' } },
  titleMultiloc: { en: 'Folder one' },
};

describe('DescriptionBuilderPage save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddLayoutError = null;
  });

  it('saves the folder description layout directly', async () => {
    render(<DescriptionBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockAddContentBuilderLayout).toHaveBeenCalled());

    expect(mockAddContentBuilderLayout).toHaveBeenCalledWith({
      contentBuildableId: 'folder-1',
      contentBuildableType: 'folder',
      enabled: true,
      craftjs_json: EDITED_NODES,
    });
  });

  it('shows no save error before a save fails', () => {
    render(<DescriptionBuilderPage {...defaultProps} />);

    expect(screen.getByTestId('mockSaveError')).toBeEmptyDOMElement();
  });

  it('tells the top bar when a save is refused because of a file', () => {
    mockAddLayoutError = { errors: { base: [{ error: 'unauthorized_file' }] } };
    render(<DescriptionBuilderPage {...defaultProps} />);

    expect(screen.getByTestId('mockSaveError')).toHaveTextContent(
      'unauthorizedFile'
    );
  });

  it('tells the top bar about any other failed save', () => {
    mockAddLayoutError = new Error('Network error');
    render(<DescriptionBuilderPage {...defaultProps} />);

    expect(screen.getByTestId('mockSaveError')).toHaveTextContent('generic');
  });
});
