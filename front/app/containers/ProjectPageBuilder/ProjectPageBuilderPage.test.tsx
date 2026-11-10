import React from 'react';

import { SerializedNodes } from '@craftjs/core';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import ProjectPageBuilderPage from './ProjectPageBuilderPage';

const EDITED_NODES = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: {},
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

jest.mock('components/ProjectPageBuilder/TopBar', () => ({
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
jest.mock('components/ProjectPageBuilder/Toolbox', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/ProjectPageBuilder/EditModePreview', () => ({
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
jest.mock(
  'components/admin/ContentBuilder/DropFeedback/DropPlacementOverlay',
  () => ({
    __esModule: true,
    default: () => null,
  })
);
jest.mock('components/ProjectPageBuilder/Editor', () => ({
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
    pathname: '/en/admin/project-page-builder/projects/project-1',
  }),
}));

const mockUpsertProjectPageLayout = jest.fn<Promise<void>, unknown[]>(() =>
  Promise.resolve()
);
jest.mock('api/project_page_layout/useUpsertProjectPageLayout', () =>
  jest.fn(() => ({ mutateAsync: mockUpsertProjectPageLayout }))
);
const mockUpdateProject = jest.fn(() => Promise.resolve());
jest.mock('api/projects/useUpdateProject', () =>
  jest.fn(() => ({ mutateAsync: mockUpdateProject }))
);

jest.mock('api/project_page_layout/useProjectPageLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      data: {
        id: 'project-layout-1',
        attributes: { enabled: true, craftjs_json: { ROOT: {} } },
      },
    },
  })),
}));

const defaultProps: React.ComponentProps<typeof ProjectPageBuilderPage> = {
  projectId: 'project-1',
  backPath: '/admin/projects/project-1',
  previewLink: { to: '/projects/$slug', params: { slug: 'project-1' } },
  titleMultiloc: { en: 'Project one' },
};

describe('ProjectPageBuilderPage save errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows no save error after a successful save', async () => {
    render(<ProjectPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertProjectPageLayout).toHaveBeenCalled());
    expect(screen.getByTestId('mockSaveError')).toBeEmptyDOMElement();
  });

  it('tells the top bar when a save is refused because of a file', async () => {
    mockUpsertProjectPageLayout.mockRejectedValueOnce({
      errors: { base: [{ error: 'unauthorized_file' }] },
    });
    render(<ProjectPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() =>
      expect(screen.getByTestId('mockSaveError')).toHaveTextContent(
        'unauthorizedFile'
      )
    );
  });

  it('tells the top bar about any other failed save', async () => {
    mockUpsertProjectPageLayout.mockRejectedValueOnce(
      new Error('Network error')
    );
    render(<ProjectPageBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() =>
      expect(screen.getByTestId('mockSaveError')).toHaveTextContent('generic')
    );
  });
});
