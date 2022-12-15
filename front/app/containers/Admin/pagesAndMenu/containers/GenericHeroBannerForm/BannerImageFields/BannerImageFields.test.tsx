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
  it('renders properly', () => {
    render(<BannerImageFields {...props} />);

    expect(screen.getByText('Header image')).toBeInTheDocument();
  });

  describe('Full-width banner layout', () => {
    describe('Layout preview selector', () => {
      it('shows display preview select', async () => {
        render(<BannerImageFields {...props} />);

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
        render(<BannerImageFields {...props} />);

        await waitFor(() => {
          const overlayInput = screen.getByLabelText('Image overlay color');
          expect(overlayInput).toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show when image is uploaded but not saved', async () => {
        const { container } = render(
          <BannerImageFields
            {...props}
            bannerLayout="full_width_banner_layout"
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
          expect(cropContainer).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Two-column layout', () => {
    // TO DO: tests to ensure it shows the layout preview selector?

    describe('Image overlay controls', () => {
      it('does not show overlay controls correctly', async () => {
        render(
          <BannerImageFields {...props} bannerLayout="two_column_layout" />
        );

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });

    // TO DO: tests to ensure image cropper is not shown?
  });

  describe('Two-row layout', () => {
    // TO DO: tests to ensure it shows the layout preview selector?

    describe('Image overlay controls', () => {
      it('does not show overlay controls correctly', async () => {
        render(<BannerImageFields {...props} bannerLayout="two_row_layout" />);

        await waitFor(() => {
          const overlayInput = screen.queryByLabelText('Image overlay color');
          expect(overlayInput).not.toBeInTheDocument();
        });
      });
    });

    describe('Image cropper', () => {
      it('does not show when image is uploaded but not saved', async () => {
        const { container } = render(
          <BannerImageFields {...props} bannerLayout="two_row_layout" />
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
    });
  });
});

describe('Fixed-ratio layout', () => {
  describe('Layout preview selector', () => {
    it('does not show display preview select', async () => {
      render(
        <BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />
      );

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
      render(
        <BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />
      );

      await waitFor(() => {
        const overlayInput = screen.getByLabelText('Image overlay color');
        expect(overlayInput).toBeInTheDocument();
      });
    });
  });

  describe('Image cropper', () => {
    it('does not show when image is saved', async () => {
      const { container } = render(
        <BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />
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
        <BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />
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
