import React from 'react';
import BannerImageFields from '.';
import { render, screen, waitFor, fireEvent, act } from 'utils/testUtils/rtl';

jest.mock('utils/cl-intl');

const props = {
  bannerOverlayColor: '#fff',
  bannerOverlayOpacity: 90,
  bannerLayout: 'full_width_banner_layout' as const,
  headerBg: {
    small: 'url',
    medium: 'medium',
    large: 'https://demo.stg.citizenlab.co/upload.png',
  },
  onAddImage: jest.fn(),
  onRemoveImage: jest.fn(),
  setFormStatus: jest.fn(),
  onOverlayChange: jest.fn(),
};

describe('BannerImageFields', () => {
  describe('Layout preview selector', () => {
    it('shows when there is a saved image', async () => {
      render(<BannerImageFields {...props} />);

      await waitFor(() => {
        const select = screen.getByRole('combobox', {
          name: /Show preview for/,
        });
        expect(select).toBeInTheDocument();
      });
    });

    it('does not show when there is no uploaded (but unsaved) nor saved image', async () => {
      render(<BannerImageFields {...props} headerBg={null} />);

      await waitFor(() => {
        const select = screen.queryByRole('combobox', {
          name: /Show preview for/,
        });
        expect(select).not.toBeInTheDocument();
      });
    });

    it('shows when there is an uploaded image that is not saved yet', async () => {
      const { container } = render(
        <BannerImageFields {...props} headerBg={null} />
      );

      const file = new File(['file'], 'file.png', {
        type: 'image/png',
      });

      act(() => {
        fireEvent.change(container.querySelector('#header-dropzone'), {
          target: { files: [file] },
        });
      });

      await waitFor(() => {
        const select = screen.getByRole('combobox', {
          name: /Show preview for/,
        });
        expect(select).toBeInTheDocument();
      });
    });

    // describe('Fixed-ratio banner layout', () => {
    //   it('does not show when there is a saved image', async () => {
    //     render(
    //       <BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />
    //     );

    //     await waitFor(() => {
    //       const select = screen.queryByRole('combobox', {
    //         name: /Show preview for/,
    //       });
    //       expect(select).toBeNull();
    //     });
    //   });
    // });
  });

  describe('Full-width banner layout', () => {
    const bannerLayout = 'full_width_banner_layout';

    describe('Image overlay controls', () => {
      it('shows overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.getByLabelText('Image overlay color');
          expect(overlayInput).toBeInTheDocument();
        });
      });

      it('does not show if we have not selected an image yet', async () => {
        render(
          <BannerImageFields
            {...props}
            bannerLayout={bannerLayout}
            headerBg={null}
          />
        );

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).toBeNull();
        });
      });
    });
  });

  describe('Two-column layout', () => {
    const bannerLayout = 'two_column_layout';

    describe('Image overlay controls', () => {
      it('does not show', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Two-row layout', () => {
    const bannerLayout = 'two_row_layout';

    describe('Image overlay controls', () => {
      it('does not show', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    describe('Image overlay controls', () => {
      it('shows overlay controls when we have a saved picture', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).toBeInTheDocument();
        });
      });

      it('does not show when there is no saved image yet', async () => {
        render(
          <BannerImageFields
            {...props}
            headerBg={null}
            bannerLayout={bannerLayout}
          />
        );
        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).toBeNull();
        });
      });

      it('does not show when we have selected a picture that is not saved yet', async () => {
        const { container } = render(
          <BannerImageFields
            {...props}
            headerBg={null}
            bannerLayout={bannerLayout}
          />
        );

        const file = new File(['file'], 'file.png', {
          type: 'image/png',
        });

        act(() => {
          fireEvent.change(container.querySelector('#header-dropzone'), {
            target: { files: [file] },
          });
        });

        await waitFor(() => {
          const overlayInput = container.querySelector('Image overlay color');
          expect(overlayInput).toBeNull();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show when there is no image', async () => {
        const { container } = render(
          <BannerImageFields
            {...props}
            bannerLayout={bannerLayout}
            headerBg={null}
          />
        );

        await waitFor(() => {
          const cropContainer = container.querySelector(
            '.reactEasyCrop_Container'
          );

          expect(cropContainer).not.toBeInTheDocument();
        });
      });

      it('does not show when image is saved', async () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
        );

        await waitFor(() => {
          const cropContainer = container.querySelector(
            '.reactEasyCrop_Container'
          );
          expect(cropContainer).not.toBeInTheDocument();
        });
      });

      it('shows when image is uploaded but not saved', async () => {
        const { container } = render(
          <BannerImageFields
            {...props}
            bannerLayout={bannerLayout}
            headerBg={null}
          />
        );

        const file = new File(['file'], 'file.png', {
          type: 'image/png',
        });

        act(() => {
          fireEvent.change(container.querySelector('#header-dropzone'), {
            target: { files: [file] },
          });
        });

        await waitFor(() => {
          const cropContainer = container.querySelector(
            '.reactEasyCrop_Container'
          );
          expect(cropContainer).toBeInTheDocument();
        });
      });
    });
  });
});
