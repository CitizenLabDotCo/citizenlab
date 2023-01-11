import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import HomePage from '.';
import {
  THomepageBannerLayout,
  IHomepageSettingsData,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');
jest.mock('services/homepageSettings', () => ({
  updateHomepageSettings: jest.fn(),
}));
jest.mock('hooks/useHomepageSettings', () => jest.fn());

const mockHomepageSettings = (bannerLayout: THomepageBannerLayout) => ({
  attributes: {
    banner_layout: bannerLayout,
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    header_bg: {
      small: 'https://example.com/image.png',
      medium: 'https://example.com/image.png',
      large: 'https://example.com/image.png',
    },
    top_info_section_multiloc: { en: 'Top info section' },
    bottom_info_section_multiloc: { en: 'Bottom info section' },
    projects_header_multiloc: { en: 'Projects header' },
    banner_signed_out_header_multiloc: { en: 'Signed out header' },
    banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
    banner_signed_out_header_overlay_color: 'blue',
    banner_signed_out_header_overlay_opacity: 80,
    pinned_admin_publication_ids: ['test-id'],
    top_info_section_enabled: true,
    bottom_info_section_enabled: true,
    banner_avatars_enabled: true,
    projects_enabled: true,
    banner_cta_signed_in_text_multiloc: { en: 'Banner CTA signed in text' },
    banner_cta_signed_in_type: 'no_button',
    banner_cta_signed_in_url: null,
    banner_cta_signed_out_text_multiloc: { en: 'Banner CTA signed out text' },
    banner_cta_signed_out_type: 'no_button',
    banner_cta_signed_out_url: null,
    events_widget_enabled: true,
  },
});

describe('<HomePage />', () => {
  it('renders with HomepageSettings for logged out users', () => {
    useHomepageSettings.mockImplementation(() =>
      mockHomepageSettings('full_width_banner_layout')
    );
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Signed out header', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Signed out subhead', level: 2 })
    ).toBeInTheDocument();
  });

  it('renders the two-row layout with correct styles', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Signed out header', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Signed out subhead', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toBeInTheDocument();
    expect(screen.getByTestId('two-row-layout')).toHaveStyle('width: 100%');
    expect(screen.getByTestId('two-row-layout')).toHaveStyle(
      'background: white'
    );
  });
});
