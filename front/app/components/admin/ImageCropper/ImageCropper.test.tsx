import React from 'react';
import { screen, render } from 'utils/testUtils/rtl';
import ImageCropper from './';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

const getImage = async () =>
  await convertUrlToUploadFile(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  );
describe('ImageCropper', () => {
  it('renders image when there is an image', async () => {
    const image = (await getImage()) as UploadFile;
    render(
      <ImageCropper
        image={image}
        aspect={3 / 1}
        onComplete={jest.fn()}
        onRemove={jest.fn()}
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
  it('does not render when there is no image', () => {
    render(
      <ImageCropper
        image={null}
        onComplete={jest.fn()}
        aspect={3 / 1}
        onRemove={jest.fn()}
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
