import React from 'react';
import BannerImageFields from '.';
import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

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
  it('does not show when there is no image', () => {
    render(<BannerImageFields {...props} headerBg={null} />);

    const select = screen.queryByLabelText('Show preview for');
    expect(select).not.toBeInTheDocument();
  });

  it('shows when there is a saved image', () => {
    render(<BannerImageFields {...props} />);

    const select = screen.getByLabelText('Show preview for');
    expect(select).toBeInTheDocument();
  });

  it('shows when there is an unsaved image', async () => {
    render(<BannerImageFields {...props} headerBg={null} />);

    await uploadLocalImageForHeroBanner();
    const select = screen.getByLabelText('Show preview for');
    expect(select).toBeInTheDocument();
  });

  describe('when layout is fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    it('does not show when there is no image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);
      const select = screen.queryByLabelText('Show preview for');
      expect(select).not.toBeInTheDocument();
    });

    it('does not show when there is a saved image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      const select = screen.queryByLabelText('Show preview for');
      expect(select).not.toBeInTheDocument();
    });

    it('does not show when there is an unsaved image', async () => {
      render(<BannerImageFields {...props} headerBg={null} />);

      await uploadLocalImageForHeroBanner();
      const select = screen.queryByRole('select', {
        name: /Show preview for/,
      });
      expect(select).not.toBeInTheDocument();
    });
  });
});

describe('Image overlay toggle', () => {
  describe('when layout is full-width banner layout', () => {
    it('does not show if there is no image', () => {
      render(<BannerImageFields {...props} headerBg={null} />);

      const overlayInput = screen.queryByLabelText('Enable overlay');
      expect(overlayInput).not.toBeInTheDocument();
    });

    it('shows when there is an unsaved image', async () => {
      render(<BannerImageFields {...props} headerBg={null} />);

      await uploadLocalImageForHeroBanner();
      expect(screen.getByLabelText('Enable overlay')).toBeInTheDocument();
    });

    it('shows when there is a saved image', () => {
      render(<BannerImageFields {...props} />);

      const overlayInput = screen.getByLabelText('Enable overlay');
      expect(overlayInput).toBeInTheDocument();
    });
  });

  describe('when layout is two-row layout', () => {
    const bannerLayout = 'two_row_layout';

    it('does not show when there is an unsaved image', async () => {
      render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      await uploadLocalImageForHeroBanner();
      expect(screen.queryByLabelText('Enable overlay')).not.toBeInTheDocument();
    });

    it('does not show when there is a saved image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      expect(screen.queryByLabelText('Enable overlay')).not.toBeInTheDocument();
    });
  });

  describe('when layout is two-column layout', () => {
    const bannerLayout = 'two_column_layout';

    it('does not show when there is an unsaved image', async () => {
      render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      await uploadLocalImageForHeroBanner();
      expect(screen.queryByLabelText('Enable overlay')).not.toBeInTheDocument();
    });

    it('does not show when there is a saved image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      expect(screen.queryByLabelText('Enable overlay')).not.toBeInTheDocument();
    });
  });

  describe('when layout is fixed-ratio layout', () => {
    const bannerLayout = 'fixed_ratio_layout';

    it('does not show when there is an unsaved image', () => {
      render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      expect(screen.queryByLabelText('Enable overlay')).not.toBeInTheDocument();
    });

    it('shows when there is a saved image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      waitFor(() =>
        expect(screen.getByLabelText('Enable overlay')).toBeInTheDocument()
      );
    });
  });
});

describe('Image cropper', () => {
  describe('when layout is fixed-ratio', () => {
    const bannerLayout = 'fixed_ratio_layout';

    it('shows when there is an unsaved image', () => {
      render(
        <BannerImageFields
          {...props}
          bannerLayout={bannerLayout}
          headerBg={null}
        />
      );

      uploadLocalImageForHeroBanner().then(() => {
        expect(screen.getByTestId('image-cropper')).toBeInTheDocument();
      });
    });

    it('does not show when there is a saved image', () => {
      render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

      expect(screen.queryByTestId('image-cropper')).not.toBeInTheDocument();
    });
  });

  describe('when layout is not fixed-ratio', () => {
    it('does not show with an unsaved image', () => {
      render(<BannerImageFields {...props} headerBg={null} />);

      uploadLocalImageForHeroBanner().then(() => {
        expect(screen.queryByTestId('image-cropper')).not.toBeInTheDocument();
      });
    });

    it('does not show when there is a saved image', () => {
      render(<BannerImageFields {...props} />);

      expect(screen.queryByTestId('image-cropper')).not.toBeInTheDocument();
    });
  });
});

async function uploadLocalImageForHeroBanner() {
  const inputNode = screen.getByLabelText('Select an image (max. 10MB)');
  const file = new File(['file'], 'file.png', {
    type: 'image/png',
  });
  await userEvent.upload(inputNode, file);
}
