import React from 'react';

import FolderContentViewer from 'components/DescriptionBuilder/ContentViewer/FolderContentViewer';

import { render, screen } from 'utils/testUtils/rtl';

const folderId = 'id';
const folderTitle = {
  en: 'Folder title',
};

const DEFAULT_FOLDER_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: true,
      craftjs_json: {
        ROOT: {
          type: 'div',
          isCanvas: true,
          props: {
            id: 'e2e-content-builder-frame',
          },
          displayName: 'div',
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
        },
      },
    },
  },
};

const mockFolderDescriptionBuilderLayoutData:
  | typeof DEFAULT_FOLDER_DESCRIPTION_BUILDER_LAYOUT_DATA
  | undefined
  | Error = DEFAULT_FOLDER_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockFolderDescriptionBuilderLayoutData,
  };
});

describe('Preview', () => {
  it('should show content builder content when folder description builder is enabled', () => {
    render(
      <FolderContentViewer folderId={folderId} folderTitle={folderTitle} />
    );
    expect(
      screen.getByTestId('descriptionBuilderFolderPreviewContent')
    ).toBeInTheDocument();
  });

  it('should return nothing when description builder is not enabled', () => {
    DEFAULT_FOLDER_DESCRIPTION_BUILDER_LAYOUT_DATA.data.attributes.enabled =
      false;
    render(
      <FolderContentViewer folderId={folderId} folderTitle={folderTitle} />
    );
    expect(
      screen.queryByTestId('descriptionBuilderFolderPreviewContent')
    ).not.toBeInTheDocument();
  });
});
