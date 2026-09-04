import React from 'react';

import { render } from 'utils/testUtils/rtl';

import FileAttachment from '.';

let inBuilder = false;
jest.mock('@craftjs/core', () => ({
  useEditor: (
    collect?: (state: { options: { enabled: boolean } }) => unknown
  ) => ({
    ...(collect
      ? (collect({ options: { enabled: inBuilder } }) as object)
      : {}),
    query: { getSerializedNodes: () => ({}) },
  }),
  useNode: (collect?: (node: { data: { props: unknown } }) => unknown) => ({
    ...(collect ? (collect({ data: { props: {} } }) as object) : {}),
    actions: { setProp: jest.fn() },
  }),
}));

let layoutId: string | undefined = 'layout-1';
jest.mock(
  'components/admin/ContentBuilder/context/ContentBuilderLayoutContext',
  () => ({
    useContentBuilderLayoutContext: () => ({ layoutId }),
  })
);

const attachment = {
  attributes: {
    file_name: 'minutes.pdf',
    file_size: 1024,
    created_at: '',
    updated_at: '',
    file_url: 'https://example.com/minutes.pdf',
  },
  relationships: { file: { data: { id: 'file-1' } } },
};

let attachments: unknown = { data: [attachment] };
jest.mock('api/file_attachments/useFileAttachments', () => ({
  __esModule: true,
  default: () => ({ data: attachments }),
}));
jest.mock('api/files/useFileById', () => ({
  __esModule: true,
  default: () => ({ data: undefined, isLoading: false }),
}));
const filesQuery = jest.fn();
let availableFiles: { id: string; attributes: { name: string } }[] = [];
let fileIsAlreadyUsed = false;
jest.mock('./utils', () => ({
  getIsFileAlreadyUsed: () => fileIsAlreadyUsed,
}));
jest.mock('api/files/useFiles', () => ({
  __esModule: true,
  default: (params: { project?: string[] }) => {
    filesQuery(params);
    return {
      data: { data: availableFiles },
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    };
  },
}));

let routeParams: { projectId?: string } = {};
jest.mock('utils/router', () => ({ useParams: () => routeParams }));

describe('FileAttachment', () => {
  beforeEach(() => {
    inBuilder = false;
    layoutId = 'layout-1';
    attachments = { data: [attachment] };
  });

  describe('settings', () => {
    const Settings = FileAttachment.craft.related.settings;

    beforeEach(() => {
      filesQuery.mockClear();
      routeParams = {};
      availableFiles = [];
      fileIsAlreadyUsed = false;
    });

    it('asks for the project’s files when there is one', () => {
      routeParams = { projectId: 'project-1' };

      render(<Settings />);

      expect(filesQuery).toHaveBeenCalledWith(
        expect.objectContaining({ project: ['project-1'] })
      );
    });
  });
});
