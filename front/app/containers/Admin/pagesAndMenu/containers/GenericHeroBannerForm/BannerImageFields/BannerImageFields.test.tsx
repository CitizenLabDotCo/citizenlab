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

describe('Layout preview selector', () => {
  it('does not show when there is no image', async () => {
    render(<BannerImageFields {...props} headerBg={null} />);

    await waitFor(() => {
      const select = screen.queryByRole('combobox', {
        name: /Show preview for/,
      });
      expect(select).not.toBeInTheDocument();
    });
  });

  it('shows when there is a saved image', async () => {
    render(<BannerImageFields {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox', {
        name: /Show preview for/,
      });
      expect(select).toBeInTheDocument();
    });
  });

  it('shows when there is an unsaved image', async () => {
    const { container } = render(
      <BannerImageFields {...props} headerBg={null} />
    );

    // select local image
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

  describe('when layout is fixed-ratio layout', () => {
    it('does not show when there is a saved image', async () => {
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

    it('does not show when there is an unsaved image', async () => {
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
});

describe('Image overlay controls', () => {
  it('does not show if there is no image', async () => {
    render(<BannerImageFields {...props} headerBg={null} />);

    await waitFor(() => {
      const overlayInput = screen.queryByLabelText('Image overlay color');
      expect(overlayInput).toBeNull();
    });
  });
  describe('when layout is full-width banner layout', () => {
    it('shows when there is an unsaved image', async () => {
      const { container } = render(
        <BannerImageFields {...props} headerBg={null} />
      );

      // select local image
      const file = new File(['file'], 'file.png', {
        type: 'image/png',
      });
      act(() => {
        fireEvent.change(container.querySelector('#header-dropzone'), {
          target: { files: [file] },
        });
      });

      await waitFor(() => {
        const overlayInput = screen.getByLabelText('Image overlay color');
        expect(overlayInput).toBeInTheDocument();
      });
    });

    it('shows when there is a saved image', async () => {
      render(<BannerImageFields {...props} />);

      await waitFor(() => {
        const overlayInput = screen.getByLabelText('Image overlay color');
        expect(overlayInput).toBeInTheDocument();
      });
    });
  });

  describe('when layout is two-row layout', () => {
    const bannerLayout = 'two_row_layout';

    it('does not show when there is an unsaved image', async () => {
      const { container } = render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      // select local image
      const file = new File(['file'], 'file.png', {
        type: 'image/png',
      });
      act(() => {
        fireEvent.change(container.querySelector('#header-dropzone'), {
          target: { files: [file] },
        });
      });

      await waitFor(() => {
        const overlayInput = screen.queryByLabelText('Image overlay color');
        expect(overlayInput).not.toBeInTheDocument();
      });
    });

    it('does not show when there is a saved image', async () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      await waitFor(() => {
        const overlayInput = screen.queryByLabelText('Image overlay color');
        expect(overlayInput).not.toBeInTheDocument();
      });
    });
  });

  describe('when layout is two-column layout', () => {
    const bannerLayout = 'two_column_layout';

    it('does not show when there is an unsaved image', async () => {
      const { container } = render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      // select local image
      const file = new File(['file'], 'file.png', {
        type: 'image/png',
      });
      act(() => {
        fireEvent.change(container.querySelector('#header-dropzone'), {
          target: { files: [file] },
        });
      });

      await waitFor(() => {
        const overlayInput = screen.queryByLabelText('Image overlay color');
        expect(overlayInput).not.toBeInTheDocument();
      });
    });

    it('does not show when there is a saved image', async () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      await waitFor(() => {
        const overlayInput = screen.queryByLabelText('Image overlay color');
        expect(overlayInput).not.toBeInTheDocument();
      });
    });
  });

  describe('when layout is fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    it('does not show when there is an unsaved image', async () => {
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

    it('shows when there is a saved image', async () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      await waitFor(() => {
        const overlayInput = screen.getByLabelText('Image overlay color');
        expect(overlayInput).toBeInTheDocument();
      });
    });
  });
});

describe('Image cropper', () => {
  it('does not show if there is no image', async () => {
    const { container } = render(
      <BannerImageFields {...props} headerBg={null} />
    );

    await waitFor(() => {
      const cropContainer = container.querySelector('.reactEasyCrop_Container');

      expect(cropContainer).not.toBeInTheDocument();
    });
  });

  it('does not show with a saved image', async () => {
    const { container } = render(
      <BannerImageFields {...props} headerBg={null} />
    );

    await waitFor(() => {
      const cropContainer = container.querySelector('.reactEasyCrop_Container');

      expect(cropContainer).not.toBeInTheDocument();
    });
  });

  it('does not show with an unsaved image', async () => {
    const { container } = render(
      <BannerImageFields {...props} headerBg={null} />
    );

    // select local image
    const file = new File(['file'], 'file.png', {
      type: 'image/png',
    });
    act(() => {
      fireEvent.change(container.querySelector('#header-dropzone'), {
        target: { files: [file] },
      });
    });

    await waitFor(() => {
      const cropContainer = container.querySelector('.reactEasyCrop_Container');

      expect(cropContainer).not.toBeInTheDocument();
    });
  });

  describe('when layout is fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    it('does not show when there is a saved image', async () => {
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

    it('shows when there is an unsaved image', async () => {
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
