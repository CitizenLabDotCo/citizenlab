import React from 'react';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import QuillEditor from './';

// Builds a File whose reported size we control, so we don't have to allocate
// megabytes of test data to cross the limit.
const imageFileOfSize = (sizeInBytes: number) => {
  const file = new File(['x'], 'image.png', { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: sizeInBytes });
  return file;
};

const uploadThroughToolbar = (container: HTMLElement, file: File) => {
  fireEvent.click(container.querySelector('button.ql-image') as HTMLElement);

  const fileInput = container.querySelector(
    'input.ql-image[type=file]'
  ) as HTMLInputElement;
  Object.defineProperty(fileInput, 'files', { value: [file] });
  fireEvent.change(fileInput);
};

describe('QuillEditor image size limit', () => {
  it('warns and inserts nothing when the image is too large', async () => {
    const { container } = render(<QuillEditor id="editor" />);

    uploadThroughToolbar(container, imageFileOfSize(12000000));

    expect(
      await screen.findByText('This image is too large')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/exceeds the maximum allowed size of 10MB/i)
    ).toBeInTheDocument();
    expect(container.querySelector('.ql-editor img')).not.toBeInTheDocument();
  });

  it('inserts the image when it is within the limit', async () => {
    const { container } = render(<QuillEditor id="editor" />);

    uploadThroughToolbar(container, imageFileOfSize(9000000));

    await waitFor(() => {
      expect(container.querySelector('.ql-editor img')).toBeInTheDocument();
    });
    expect(
      screen.queryByText('This image is too large')
    ).not.toBeInTheDocument();
  });
});
