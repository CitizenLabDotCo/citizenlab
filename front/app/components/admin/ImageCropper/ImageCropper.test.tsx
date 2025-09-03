import React from 'react';

import { UploadFile } from 'typings';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { screen, render } from 'utils/testUtils/rtl';

import ImageCropper from './';

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
        aspectRatioWidth={3}
        aspectRatioHeight={1}
        onComplete={jest.fn()}
        onRemove={jest.fn()}
      />
    );
    expect(
      screen.getByRole('presentation', {
        name: '',
      })
    ).toBeInTheDocument();
  });
  it('does not render when there is no image', () => {
    render(
      <ImageCropper
        image={null}
        onComplete={jest.fn()}
        aspectRatioWidth={3}
        aspectRatioHeight={1}
        onRemove={jest.fn()}
      />
    );
    expect(
      screen.queryByRole('presentation', {
        name: '',
      })
    ).not.toBeInTheDocument();
  });
});
