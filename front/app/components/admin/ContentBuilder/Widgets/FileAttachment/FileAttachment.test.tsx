import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import FileAttachment from '.';

let inBuilder = false;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => unknown) =>
    collect({ options: { enabled: inBuilder } }),
  useNode: jest.fn(),
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
jest.mock('api/files/useFiles', () => ({
  __esModule: true,
  default: () => ({ data: undefined }),
}));

describe('FileAttachment', () => {
  beforeEach(() => {
    inBuilder = false;
    layoutId = 'layout-1';
    attachments = { data: [attachment] };
  });

  it('renders the attached file', () => {
    render(<FileAttachment fileId="file-1" />);

    expect(screen.getByText('minutes.pdf')).toBeInTheDocument();
  });

  // Custom pages stack these straight in the page body, where nothing else constrains them.
  it('centres the row in the page container', () => {
    render(<FileAttachment fileId="file-1" />);

    const container = document.getElementById('e2e-file-attachment');
    expect(container).toHaveStyle({ maxWidth: '1200px', margin: '0 auto' });
  });

  // It resolves through the layout's attachments, not the fileId.
  it('renders nothing in view mode when there is no layout context', () => {
    layoutId = undefined;
    attachments = undefined;

    render(<FileAttachment fileId="file-1" />);

    expect(screen.queryByText('minutes.pdf')).not.toBeInTheDocument();
    expect(document.getElementById('e2e-file-attachment')).toBeNull();
  });
});
