// for dev purposes
import React from 'react';
import { render, screen, act, fireEvent } from 'utils/testUtils/rtl';
import GenericHeroBannerForm, { HeroBannerInputSettings } from '.';
import { THomepageBannerLayout } from 'services/homepageSettings';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');

const setFormStatus = jest.fn();
const onSave = jest.fn();

const mockBreadcrumbs = [
  {
    label: 'test',
  },
];

const mockInputSettings = {
  banner_layout: 'full_width_banner_layout' as THomepageBannerLayout,
  banner_overlay_opacity: 70,
  banner_overlay_color: '#FFFFFF',
  banner_header_multiloc: { en: 'Signed out header' },
  banner_subheader_multiloc: { en: 'Signed out subhead' },
  header_bg: {
    large: 'https://example.com/image.png',
    medium: 'https://example.com/image.png',
    small: 'https://example.com/image.png',
  },
};

describe('<GenericHeroBannerForm />', () => {
  describe('as custom page', () => {
    it('renders with proper settings', () => {
      render(
        <GenericHeroBannerForm
          type="customPage"
          inputSettings={mockInputSettings}
          setFormStatus={setFormStatus}
          isLoading={false}
          breadcrumbs={mockBreadcrumbs}
          onSave={onSave}
          formStatus={'enabled'}
        />
      );
      expect(
        screen.getByText('Customise the hero banner image and text.')
      ).toBeInTheDocument();
    });

    it('correctly stores updated properties to state and sends them to the backend', async () => {
      render(
        <GenericHeroBannerForm
          type="customPage"
          inputSettings={mockInputSettings}
          setFormStatus={setFormStatus}
          isLoading={false}
          breadcrumbs={mockBreadcrumbs}
          onSave={onSave}
          formStatus={'enabled'}
        />
      );

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

      expect(onSave).toHaveBeenCalledWith({
        banner_layout: 'full_width_banner_layout',
        banner_overlay_opacity: 70,
        banner_overlay_color: '#FFFFFF',
        banner_header_multiloc: { en: 'Signed out header updated' },
        banner_subheader_multiloc: { en: 'Signed out subhead updated' },
        header_bg: {
          large: 'https://example.com/image.png',
          medium: 'https://example.com/image.png',
          small: 'https://example.com/image.png',
        },
      });
    });
  });

  describe('as home page', () => {
    jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

    const homePageInputSettings: HeroBannerInputSettings = {
      ...mockInputSettings,
      banner_avatars_enabled: false,
      banner_signed_in_header_multiloc: { en: 'Signed in header' },
      banner_cta_signed_in_text_multiloc: { en: 'cta signed in text' },
      banner_cta_signed_out_text_multiloc: { en: 'cta signed out text' },
      banner_cta_signed_in_type: 'customized_button',
      banner_cta_signed_in_url: 'https://www.google.com',
      banner_cta_signed_out_type: 'sign_up_button',
      banner_cta_signed_out_url: 'https://www.google.com',
    };

    it('renders with proper settings and additional homepage sections', () => {
      render(
        <GenericHeroBannerForm
          type="homePage"
          inputSettings={homePageInputSettings}
          setFormStatus={setFormStatus}
          isLoading={false}
          breadcrumbs={mockBreadcrumbs}
          onSave={onSave}
          formStatus={'enabled'}
        />
      );
      expect(
        screen.getByText('Customise the hero banner image and text.')
      ).toBeInTheDocument();
      expect(screen.getByText('Display avatars')).toBeInTheDocument();
      expect(
        screen.getByText('Header text for registered users')
      ).toBeInTheDocument();
    });

    it('correctly stores updated properties to state and sends them to the backend', async () => {
      render(
        <GenericHeroBannerForm
          type="homePage"
          inputSettings={homePageInputSettings}
          setFormStatus={setFormStatus}
          isLoading={false}
          breadcrumbs={mockBreadcrumbs}
          onSave={onSave}
          formStatus={'enabled'}
        />
      );

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

      expect(onSave).toHaveBeenCalledWith({
        ...homePageInputSettings,
        banner_avatars_enabled: true,
        banner_header_multiloc: { en: 'Signed out header updated' },
        banner_subheader_multiloc: { en: 'Signed out subhead updated' },
        banner_signed_in_header_multiloc: { en: 'Signed in header updated' },
      });
    });
  });
});
