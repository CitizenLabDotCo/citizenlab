import React from 'react';
import BannerImageFields, { Props } from '.';
import { render, screen, waitFor, fireEvent, act } from 'utils/testUtils/rtl';

jest.mock('utils/cl-intl');

const props = {
  bannerOverlayColor: '#fff',
  bannerOverlayOpacity: 90,
  bannerLayout: 'full_width_banner_layout',
  headerBg: {
    small: 'url',
    medium: 'medium',
    large: 'https://demo.stg.citizenlab.co/upload.png',
  },
  onAddImage: jest.fn(),
  onRemoveImage: jest.fn(),
  setFormStatus: jest.fn(),
  onOverlayColorChange: jest.fn(),
  onOverlayOpacityChange: jest.fn(),
} as Props;

describe('BannerImageFields', () => {
  describe('Full-width banner layout', () => {
    const bannerLayout = 'full_width_banner_layout';

    describe('Layout preview selector', () => {
      it('shows display preview select', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const select = screen.getByRole('combobox', {
            name: /Show preview for/,
          });
          expect(select).toBeInTheDocument();
        });
      });
    });

    describe('Image overlay controls', () => {
      it('shows overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.getByLabelText('Image overlay color');
          expect(overlayInput).toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show', () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
        );

        const cropContainer = container.querySelector(
          '.reactEasyCrop_Container'
        );
        expect(cropContainer).toBeNull();
      });
    });
  });

  describe('Two-column layout', () => {
    const bannerLayout = 'two_column_layout';

    describe('Layout preview selector', () => {
      it('shows display preview select', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const select = screen.getByRole('combobox', {
            name: /Show preview for/,
          });
          expect(select).toBeInTheDocument();
        });
      });
    });

    describe('Image overlay controls', () => {
      it('does not show overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show', () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
        );

        const cropContainer = container.querySelector(
          '.reactEasyCrop_Container'
        );
        expect(cropContainer).toBeNull();
      });
    });
  });

  describe('Two-row layout', () => {
    const bannerLayout = 'two_row_layout';

    describe('Layout preview selector', () => {
      it('shows display preview select', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const select = screen.getByRole('combobox', {
            name: /Show preview for/,
          });
          expect(select).toBeInTheDocument();
        });
      });
    });

    describe('Image overlay controls', () => {
      it('does not show overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show', () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
        );

        const cropContainer = container.querySelector(
          '.reactEasyCrop_Container'
        );
        expect(cropContainer).toBeNull();
      });
    });
  });

  describe('Fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    describe('Layout preview selector', () => {
      it('does not show display preview select', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const select = screen.queryByRole('combobox', {
            name: /Show preview for/,
          });
          expect(select).toBeNull();
        });
      });
    });

    // TO DO: should only show the overlay toggle/controls when we have a
    // saved picture. Initially, it shouldn't be there, because the image cropper
    // can't preview it.
    describe('Image overlay controls', () => {
      it('shows overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await waitFor(() => {
          const overlayInput = screen.getByLabelText('Image overlay color');
          expect(overlayInput).toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show when image is saved', async () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
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
          expect(cropContainer).not.toBeInTheDocument();
        });
      });

      it('shows when image is uploaded but not saved', async () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout={bannerLayout} />
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
