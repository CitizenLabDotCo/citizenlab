import React from 'react';

import * as fileUtils from 'utils/fileUtils';
import { screen, render, waitFor, fireEvent } from 'utils/testUtils/rtl';

import HeaderBgUploader from './';

const mockBase64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEEhEAxEAPwCwAB//2Q==';

const file = new File(['file'], 'file.jpeg', {
  type: 'image/jpeg',
});

describe('HeaderBgUploader', () => {
  beforeEach(() => {
    jest.spyOn(fileUtils, 'getBase64FromFile').mockResolvedValue(mockBase64);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders images dropzone', () => {
    const component = render(
      <HeaderBgUploader
        imageUrl={null}
        onImageChange={jest.fn()}
        headerImageAltText={{ en: 'alt text' }}
        onHeaderImageAltTextChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('images-dropzone')).toBeInTheDocument();
    expect(component.container).toHaveTextContent('Select an image');
  });

  it('renders image cropper when image is uploaded', async () => {
    const component = render(
      <HeaderBgUploader
        imageUrl={null}
        onImageChange={jest.fn()}
        headerImageAltText={{ en: 'alt text' }}
        onHeaderImageAltTextChange={jest.fn()}
      />
    );
    const dropZone = component.container.querySelector(
      '[data-testid="images-dropzone"] input'
    );

    expect(screen.getByTestId('images-dropzone')).toBeInTheDocument();

    // userEvent.upload(dropZone, file); // causes lots of warnings
    fireEvent.change(dropZone, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
    });
  });
});
