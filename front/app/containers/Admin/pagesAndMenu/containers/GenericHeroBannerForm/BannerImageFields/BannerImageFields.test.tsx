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
  onOverlayChange: jest.fn(),
} as Props;

describe('BannerImageFields', () => {
  it('renders properly', () => {
    render(<BannerImageFields {...props} />);

    expect(screen.getByText('Header image')).toBeInTheDocument();
  });
  it('shows display preview select when the layout type is not fixed_ratio_layout', async () => {
    render(<BannerImageFields {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  it('does not show display preview select when the layout type is fixed_ratio_layout', async () => {
    render(<BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />);

    await waitFor(() => {
      const select = screen.queryByLabelText('Show preview for');
      expect(select).not.toBeInTheDocument();
    });
  });

  it('shows overlay controls correctly when full_width_banner_layout', async () => {
    render(<BannerImageFields {...props} />);

    await waitFor(() => {
      const overlayInput = screen.getByLabelText('Image overlay color');
      expect(overlayInput).toBeInTheDocument();
    });
  });

  it('shows overlay controls correctly when fixed_ratio_layout', async () => {
    render(<BannerImageFields {...props} bannerLayout="fixed_ratio_layout" />);

    await waitFor(() => {
      const overlayInput = screen.getByLabelText('Image overlay color');
      expect(overlayInput).toBeInTheDocument();
    });
  });

  it('does not show overlay controls correctly when two_row_layout', async () => {
    render(<BannerImageFields {...props} bannerLayout="two_row_layout" />);

    await waitFor(() => {
      const overlayInput = screen.queryByLabelText('Image overlay color');
      expect(overlayInput).not.toBeInTheDocument();
    });
  });
  it('does not show overlay controls correctly when two_column_layout', async () => {
    render(<BannerImageFields {...props} bannerLayout="two_column_layout" />);

    await waitFor(() => {
      const overlayInput = screen.queryByLabelText('Image overlay color');
      expect(overlayInput).not.toBeInTheDocument();
    });
  });

  it('does not show react-easy-crop when image is saved for fixed_ratio_layout', async () => {
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
      const cropContainer = container.querySelector('.reactEasyCrop_Container');
      expect(cropContainer).not.toBeInTheDocument();
    });
  });
  it('shows react-easy-crop container when image is uploaded but not saved for fixed_ratio_layout', async () => {
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
      const cropContainer = container.querySelector('.reactEasyCrop_Container');
      expect(cropContainer).toBeInTheDocument();
    });
  });
  it('does not show react-easy-crop container when image is uploaded but not saved for full_width_banner_layout', async () => {
    const { container } = render(
      <BannerImageFields {...props} bannerLayout="full_width_banner_layout" />
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
      const cropContainer = container.querySelector('.reactEasyCrop_Container');
      expect(cropContainer).not.toBeInTheDocument();
    });
  });
  it('does not show react-easy-crop container when image is uploaded but not saved for two_row_banner_layout', async () => {
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
      const cropContainer = container.querySelector('.reactEasyCrop_Container');
      expect(cropContainer).not.toBeInTheDocument();
    });
  });
});
