import React from 'react';
import { render, screen, act, fireEvent } from 'utils/testUtils/rtl';
import HeroBannerForm from '.';
import * as homepageSettingsService from 'services/homepageSettings';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');

jest.mock('services/homepageSettings', () => ({
  updateHomepageSettings: jest.fn(),
}));

const mockHomepageSettings = {
  data: {
    id: '1',
    attributes: {
      banner_layout: 'full_width_banner_layout',
      banner_avatars_enabled: true,
      banner_signed_out_header_overlay_opacity: 70,
      banner_signed_out_header_overlay_color: '#FFFFFF',
      banner_signed_out_header_multiloc: { en: 'Signed out header' },
      banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
      banner_signed_in_header_multiloc: { en: 'Signed in header' },
      header_bg: { large: { url: 'https://example.com/image.png' } },
    },
  },
};

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => mockHomepageSettings);
});

describe('<HeroBannerForm />', () => {
  it('renders with HomepageSettings', () => {
    render(<HeroBannerForm />);
    expect(
      screen.getByText('Customise the hero banner image and text.')
    ).toBeInTheDocument();
  });

  it('correctly stores updated properties to state and sends them to the backend', async () => {
    render(<HeroBannerForm />);
    const spy = jest.spyOn(homepageSettingsService, 'updateHomepageSettings');

    // toggle avatar display from true to false
    await act(async () => {
      fireEvent.click(screen.getByText('Display avatars'));
    });

    // change text for various properties
    await act(async () => {
      const registeredHeaderInput =
        screen.getByDisplayValue('Signed in header');
      fireEvent.change(registeredHeaderInput, {
        target: { value: 'Signed in header updated' },
      });
    });
    await act(async () => {
      const signedOutHeaderInput =
        screen.getByDisplayValue('Signed out header');
      fireEvent.change(signedOutHeaderInput, {
        target: { value: 'Signed out header updated' },
      });
    });
    await act(async () => {
      const signedOutSubheaderInput =
        screen.getByDisplayValue('Signed out subhead');
      fireEvent.change(signedOutSubheaderInput, {
        target: { value: 'Signed out subhead updated' },
      });
    });

    // save form
    await act(async () => {
      fireEvent.click(screen.getByText('Save hero banner'));
    });

    expect(spy).toHaveBeenCalledWith({
      banner_avatars_enabled: false,
      banner_signed_out_header_multiloc: { en: 'Signed out header updated' },
      banner_signed_out_subheader_multiloc: {
        en: 'Signed out subhead updated',
      },
      banner_signed_in_header_multiloc: { en: 'Signed in header updated' },
    });
  });
});
