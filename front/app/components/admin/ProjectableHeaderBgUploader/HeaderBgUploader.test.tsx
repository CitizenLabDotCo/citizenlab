import React from 'react';
import { screen, render, waitFor, fireEvent } from 'utils/testUtils/rtl';
import HeaderBgUploader from './';

jest.mock('utils/cl-intl');

const file = new File(['file'], 'file.jpeg', {
  type: 'image/jpeg',
});

describe('HeaderBgUploader', () => {
  it('renders images dropzone', () => {
    const component = render(
      <HeaderBgUploader
        imageUrl={'http://test.com/img.png'}
        onImageChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('images-dropzone')).toBeInTheDocument();
    expect(component.container).toHaveTextContent('Select an image');
  });

  it('renders image cropper when image is uploaded', async () => {
    const component = render(
      <HeaderBgUploader
        imageUrl={'http://test.com/img.png'}
        onImageChange={jest.fn()}
      />
    );
    const dropZone = component.container.querySelector(
      '[data-testid="images-dropzone"] input'
    );

    expect(screen.getByTestId('images-dropzone')).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.change(dropZone, {
        target: { files: [file] },
      });
      expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
    });
  });
});
