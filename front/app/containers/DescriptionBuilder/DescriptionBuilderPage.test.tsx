import React from 'react';

import { SerializedNodes } from '@craftjs/core';

import {
  defaultProjectPageLayout,
  normalizeProjectPageLayout,
  DESCRIPTION_NODE_ID,
  BANNER_NODE_ID,
} from 'components/ProjectPageBuilder/defaultLayout';
import { spliceDescriptionEditorData } from 'components/ProjectPageBuilder/descriptionSection';

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
} as unknown as SerializedNodes;

jest.mock('components/DescriptionBuilder/DescriptionBuilderTopBar', () => ({
  __esModule: true,
  default: ({ onSave }: { onSave: (nodes: SerializedNodes) => void }) => (
    <button data-testid="mockSaveButton" onClick={() => onSave(EDITED_NODES)}>
      save
    </button>
  ),
}));
jest.mock('components/DescriptionBuilder/DescriptionBuilderToolbox', () => ({
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
    pathname: '/en/admin/description-builder/projects/project-1/description',
  }),
}));

const mockUpsertProjectPageLayout = jest.fn();
jest.mock('api/project_page_layout/useUpsertProjectPageLayout', () =>
  jest.fn(() => ({
    mutate: mockUpsertProjectPageLayout,
    isLoading: false,
    isError: false,
  }))
);

const mockAddContentBuilderLayout = jest.fn();
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({
    mutate: mockAddContentBuilderLayout,
    isLoading: false,
    isError: false,
  }))
);

let mockProjectDescription: Record<string, unknown>;
jest.mock('components/DescriptionBuilder/useProjectDescription', () => ({
  __esModule: true,
  default: jest.fn(() => mockProjectDescription),
}));

let mockLegacyLayoutData: Record<string, unknown> | undefined;
jest.mock('api/content_builder/useContentBuilderLayout', () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: mockLegacyLayoutData })),
}));

const cachedJson = defaultProjectPageLayout();
const freshJson = defaultProjectPageLayout();
freshJson[BANNER_NODE_ID] = {
  ...freshJson[BANNER_NODE_ID],
  props: { image: {}, alt: { en: 'Fresh banner alt' } },
};

const pageLayout = (craftjs_json: SerializedNodes) => ({
  data: { id: 'page-layout-1', attributes: { enabled: true, craftjs_json } },
});

const defaultProps = {
  contentBuildableId: 'project-1',
  contentBuildableType: 'project',
  backPath: '/admin/projects/project-1',
  previewLink: { to: '/projects/$slug', params: { slug: 'project-1' } },
  titleMultiloc: { en: 'Project one' },
} as unknown as React.ComponentProps<typeof DescriptionBuilderPage>;

describe('DescriptionBuilderPage save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('splices the edited description into a freshly fetched page layout and saves it enabled', async () => {
    mockProjectDescription = {
      isLoading: false,
      pageLayout: pageLayout(cachedJson),
      projectPageJson: normalizeProjectPageLayout(cachedJson),
      descriptionEditorData: {},
      legacyLayout: undefined,
      refetchPageLayout: jest.fn(async () => ({
        data: pageLayout(freshJson),
      })),
    };
    mockLegacyLayoutData = undefined;

    render(<DescriptionBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertProjectPageLayout).toHaveBeenCalled());

    const expectedJson = spliceDescriptionEditorData(
      normalizeProjectPageLayout(freshJson),
      EDITED_NODES
    );
    expect(mockUpsertProjectPageLayout).toHaveBeenCalledWith({
      projectId: 'project-1',
      craftjs_json: expectedJson,
      enabled: true,
    });
    expect(expectedJson[DESCRIPTION_NODE_ID].nodes).toEqual(['txt']);
    expect(expectedJson[BANNER_NODE_ID].props.alt).toEqual({
      en: 'Fresh banner alt',
    });
    expect(mockAddContentBuilderLayout).not.toHaveBeenCalled();
  });

  it('falls back to the cached page layout when the refetch returns no data', async () => {
    mockProjectDescription = {
      isLoading: false,
      pageLayout: pageLayout(cachedJson),
      projectPageJson: normalizeProjectPageLayout(cachedJson),
      descriptionEditorData: {},
      legacyLayout: undefined,
      refetchPageLayout: jest.fn(async () => ({ data: undefined })),
    };
    mockLegacyLayoutData = undefined;

    render(<DescriptionBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockUpsertProjectPageLayout).toHaveBeenCalled());

    expect(mockUpsertProjectPageLayout).toHaveBeenCalledWith({
      projectId: 'project-1',
      craftjs_json: spliceDescriptionEditorData(
        normalizeProjectPageLayout(cachedJson),
        EDITED_NODES
      ),
      enabled: true,
    });
  });

  it('saves the legacy layout for a project without a page layout', async () => {
    mockProjectDescription = {
      isLoading: false,
      pageLayout: undefined,
      projectPageJson: undefined,
      descriptionEditorData: undefined,
      legacyLayout: {
        data: {
          id: 'legacy-1',
          attributes: { enabled: true, craftjs_json: { ROOT: {} } },
        },
      },
      refetchPageLayout: jest.fn(),
    };
    mockLegacyLayoutData = undefined;

    render(<DescriptionBuilderPage {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockAddContentBuilderLayout).toHaveBeenCalled());

    expect(mockAddContentBuilderLayout).toHaveBeenCalledWith({
      contentBuildableId: 'project-1',
      contentBuildableType: 'project',
      enabled: true,
      craftjs_json: EDITED_NODES,
    });
    expect(mockUpsertProjectPageLayout).not.toHaveBeenCalled();
  });

  it('saves the folder description layout directly', async () => {
    mockProjectDescription = {
      isLoading: false,
      pageLayout: undefined,
      projectPageJson: undefined,
      descriptionEditorData: undefined,
      legacyLayout: undefined,
      refetchPageLayout: jest.fn(),
    };
    mockLegacyLayoutData = {
      data: {
        id: 'folder-layout-1',
        attributes: { enabled: true, craftjs_json: { ROOT: {} } },
      },
    };

    render(
      <DescriptionBuilderPage
        {...defaultProps}
        contentBuildableId="folder-1"
        contentBuildableType="folder"
      />
    );
    fireEvent.click(screen.getByTestId('mockSaveButton'));

    await waitFor(() => expect(mockAddContentBuilderLayout).toHaveBeenCalled());

    expect(mockAddContentBuilderLayout).toHaveBeenCalledWith({
      contentBuildableId: 'folder-1',
      contentBuildableType: 'folder',
      enabled: true,
      craftjs_json: EDITED_NODES,
    });
    expect(mockUpsertProjectPageLayout).not.toHaveBeenCalled();
  });
});
