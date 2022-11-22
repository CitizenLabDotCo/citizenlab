import React from 'react';
import { fireEvent, render, screen, waitFor } from 'utils/testUtils/rtl';
import HeaderImageDropzone from './HeaderImageDropzone';

jest.mock('utils/cl-intl');
const file = new File(['file'], 'file.jpeg', {
  type: 'image/jpeg',
});

describe('HeaderImageDropzone', () => {
  it('renders properly', () => {
    const component = render(
      <HeaderImageDropzone
        overlayColor={'#fff'}
        overlayOpacity={90}
        header_bg={null}
        previewDevice="desktop"
        layout="full_width_banner_layout"
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        headerError={null}
      />
    );
    const dropZone = component.container.querySelector('#header-dropzone');
    expect(dropZone).toBeInTheDocument();
  });

  it('fires the onAdd handlers properly when an image is added and removed', async () => {
    const onAdd = jest.fn();

    const component = render(
      <HeaderImageDropzone
        overlayColor={'#fff'}
        overlayOpacity={90}
        header_bg={null}
        previewDevice="desktop"
        layout="full_width_banner_layout"
        onAdd={onAdd}
        onRemove={jest.fn()}
        headerError={null}
      />
    );

    const dropZone = component.container.querySelector('#header-dropzone');

    await waitFor(() => {
      fireEvent.change(dropZone, {
        target: { files: [file] },
      });
    });
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith([
        expect.objectContaining({
          base64: expect.any(String),
          path: 'file.jpeg',
        }),
      ])
    );
  });

  it('fires the onRemove handlers properly when an image is added and removed', async () => {
    const onRemove = jest.fn();

    const mockUploadFileParams = {
      id: 'id',
      filename: 'dog.jpeg',
      base64: 'test',
      url: 'test',
      remote: true,
      path: 'file.jpeg',
    };

    const mockUploadFile = {
      ...file,
      ...mockUploadFileParams,
    };

    render(
      <HeaderImageDropzone
        overlayColor={'#fff'}
        overlayOpacity={90}
        header_bg={[mockUploadFile]}
        previewDevice="desktop"
        layout="full_width_banner_layout"
        onAdd={jest.fn()}
        onRemove={onRemove}
        headerError={null}
      />
    );

    await waitFor(() => {
      screen.getByRole('button').click();
    });

    await waitFor(() => expect(onRemove).toHaveBeenCalled());
  });
});
