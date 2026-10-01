import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import BannerImageFields from '.';

const props = {
  bannerOverlayColor: '#fff',
  bannerOverlayOpacity: 90,
  bannerLayout: 'full_width_banner_layout' as const,
  headerBg: null,
  onAddImage: jest.fn(),
  onRemoveImage: jest.fn(),
  onOverlayChange: jest.fn(),
};

async function uploadLocalImageForHeroBanner() {
  const inputNode = screen.getByTestId('dropzone-input');
  const file = new File(['file'], 'file.png', {
    type: 'image/png',
  });
  await userEvent.upload(inputNode, file);
}

describe('BannerImageFields', () => {
  describe('Layout preview selector', () => {
    it('does not show when there is no image', () => {
      render(<BannerImageFields {...props} />);

      const select = screen.queryByLabelText('Show preview for');
      expect(select).not.toBeInTheDocument();
    });

    it('shows when there is an unsaved image', async () => {
      render(<BannerImageFields {...props} />);

      await uploadLocalImageForHeroBanner();
      const select = await screen.findByLabelText('Show preview for');
      expect(select).toBeInTheDocument();
    });

    describe('when layout is fixed-ratio layout', () => {
      it('does not show when there is an unsaved image', async () => {
        render(
          <BannerImageFields {...props} bannerLayout={'fixed_ratio_layout'} />
        );

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
        render(<BannerImageFields {...props} />);

        const overlayInput = screen.queryByLabelText('Enable overlay');
        expect(overlayInput).not.toBeInTheDocument();
      });

      it('shows when there is an unsaved image', async () => {
        render(<BannerImageFields {...props} />);

        await uploadLocalImageForHeroBanner();
        expect(
          await screen.findByLabelText('Enable overlay')
        ).toBeInTheDocument();
      });
    });

    describe('when layout is two-row layout', () => {
      const bannerLayout = 'two_row_layout';

      it('does not show when there is an unsaved image', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await uploadLocalImageForHeroBanner();
        expect(
          screen.queryByLabelText('Enable overlay')
        ).not.toBeInTheDocument();
      });
    });

    describe('when layout is two-column layout', () => {
      const bannerLayout = 'two_column_layout';

      it('does not show when there is an unsaved image', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await uploadLocalImageForHeroBanner();
        expect(
          screen.queryByLabelText('Enable overlay')
        ).not.toBeInTheDocument();
      });
    });

    describe('when layout is fixed-ratio layout', () => {
      const bannerLayout = 'fixed_ratio_layout';

      it('does not show when there is an unsaved image', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);
        await uploadLocalImageForHeroBanner();

        expect(
          screen.queryByLabelText('Enable overlay')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Image cropper', () => {
    describe('when layout is fixed-ratio', () => {
      const bannerLayout = 'fixed_ratio_layout';

      it('shows when there is an unsaved image', async () => {
        render(<BannerImageFields {...props} bannerLayout={bannerLayout} />);

        await uploadLocalImageForHeroBanner();
        expect(await screen.findByTestId('image-cropper')).toBeInTheDocument();
      });
    });

    describe('when layout is not fixed-ratio', () => {
      it('does not show with an unsaved image', () => {
        render(<BannerImageFields {...props} />);

        uploadLocalImageForHeroBanner().then(() => {
          expect(screen.queryByTestId('image-cropper')).not.toBeInTheDocument();
        });
      });
    });
  });
});
