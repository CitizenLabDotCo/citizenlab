import React from 'react';
import { render, screen, act, fireEvent } from 'utils/testUtils/rtl';

import Outlet from 'components/Outlet';
import GenericHeroBannerForm from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm';
import BannerHeaderFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderFields';
import BannerHeaderMultilocField from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerHeaderMultilocField';
import BannerImageFields from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields';
import AvatarsField from '../../containers/GenericHeroBannerForm/AvatarsField';
import { THomepageBannerLayout } from 'services/homepageSettings';

jest.mock('services/locale');
jest.mock('services/appConfiguration');
jest.mock('utils/analytics');
jest.mock('utils/cl-router/withRouter');
jest.mock('utils/cl-router/Link');

const handleOnChange = jest.fn();
const setFormStatus = jest.fn();
const handleSave = jest.fn();
const onHeaderChange = jest.fn();
const onSubHeaderChange = jest.fn();
const onBannerTypeChange = jest.fn();
const handleBannerSignedInMultilocOnChange = jest.fn();
const handleOnChangeBannerAvatarsEnabled = jest.fn();

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

describe('EditHomepage HeroBanner index', () => {
  jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

  const mockLocalSettings = {
    ...mockInputSettings,
    banner_avatars_enabled: true,
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    banner_cta_signed_in_text_multiloc: { en: 'cta signed in text' },
    banner_cta_signed_out_text_multiloc: { en: 'cta signed out text' },
    banner_cta_signed_in_type: 'customized_button',
    banner_cta_signed_in_url: 'https://www.google.com',
    banner_cta_signed_out_type: 'sign_up_button',
    banner_cta_signed_out_url: 'https://www.google.com',
  };

  it('renders properly', async () => {
    render(
      <GenericHeroBannerForm
        onSave={handleSave}
        title={'Homepage banner title'}
        isLoading={false}
        formStatus={'enabled'}
        breadcrumbs={[
          {
            label: 'pages and menu',
          },
          {
            label: 'home page',
          },
          { label: 'hero banner' },
        ]}
        setFormStatus={setFormStatus}
        bannerImageFieldsComponent={
          <BannerImageFields
            bannerLayout={mockLocalSettings.banner_layout}
            bannerOverlayColor={mockLocalSettings.banner_overlay_color}
            bannerOverlayOpacity={mockLocalSettings.banner_overlay_opacity}
            headerBg={mockLocalSettings.header_bg}
            setFormStatus={setFormStatus}
            onAddImage={() => {}}
            onRemoveImage={() => {}}
            onOverlayColorChange={() => {}}
            onOverlayOpacityChange={() => {}}
          />
        }
        bannerHeaderFieldsComponent={
          <BannerHeaderFields
            bannerHeaderMultiloc={mockLocalSettings.banner_header_multiloc}
            bannerSubheaderMultiloc={
              mockLocalSettings.banner_subheader_multiloc
            }
            onHeaderChange={onHeaderChange}
            onSubheaderChange={onSubHeaderChange}
            title={'banner header fields'}
            inputLabelText={'header text'}
            subheaderInputLabelText={'subheader text'}
          />
        }
        outletSectionStart={
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionStart"
            bannerLayout={
              mockLocalSettings.banner_layout ?? 'full_width_banner_layout'
            }
            onChange={onBannerTypeChange}
          />
        }
        bannerMultilocFieldComponent={
          <BannerHeaderMultilocField
            onChange={handleBannerSignedInMultilocOnChange}
            headerMultiloc={mockLocalSettings.banner_signed_in_header_multiloc}
          />
        }
        avatarsFieldComponent={
          <AvatarsField
            checked={mockLocalSettings.banner_avatars_enabled}
            onChange={handleOnChangeBannerAvatarsEnabled}
          />
        }
        outletSectionEnd={
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionEnd"
            banner_cta_signed_in_text_multiloc={
              mockLocalSettings.banner_cta_signed_in_text_multiloc
            }
            banner_cta_signed_in_url={
              mockLocalSettings.banner_cta_signed_in_url
            }
            // @ts-ignore
            banner_cta_signed_in_type={
              mockLocalSettings.banner_cta_signed_in_type
            }
            banner_cta_signed_out_text_multiloc={
              mockLocalSettings.banner_cta_signed_out_text_multiloc
            }
            banner_cta_signed_out_url={
              mockLocalSettings.banner_cta_signed_out_url
            }
            // @ts-ignore
            banner_cta_signed_out_type={
              mockLocalSettings.banner_cta_signed_out_type
            }
            handleOnChange={handleOnChange}
          />
        }
      />
    );

    expect(
      screen.getByText('Customise the hero banner image and text.')
    ).toBeInTheDocument();
    expect(screen.getByText('Display avatars')).toBeInTheDocument();
    expect(
      screen.getByText('Header text for registered users')
    ).toBeInTheDocument();
    expect(screen.getByText('banner header fields')).toBeInTheDocument();
    expect(screen.getByText('header text')).toBeInTheDocument();
  });

  it('changes settings and sends them to the backend properly', async () => {
    render(
      <GenericHeroBannerForm
        onSave={handleSave}
        title={'Homepage banner title'}
        isLoading={false}
        formStatus={'enabled'}
        breadcrumbs={[
          {
            label: 'pages and menu',
          },
          {
            label: 'home page',
          },
          { label: 'hero banner' },
        ]}
        setFormStatus={setFormStatus}
        bannerImageFieldsComponent={
          <BannerImageFields
            bannerLayout={mockLocalSettings.banner_layout}
            bannerOverlayColor={mockLocalSettings.banner_overlay_color}
            bannerOverlayOpacity={mockLocalSettings.banner_overlay_opacity}
            headerBg={mockLocalSettings.header_bg}
            setFormStatus={setFormStatus}
            onAddImage={() => {}}
            onRemoveImage={() => {}}
            onOverlayColorChange={() => {}}
            onOverlayOpacityChange={() => {}}
          />
        }
        bannerHeaderFieldsComponent={
          <BannerHeaderFields
            bannerHeaderMultiloc={{ en: 'current header text' }}
            bannerSubheaderMultiloc={{ en: 'current subheader text' }}
            onHeaderChange={onHeaderChange}
            onSubheaderChange={onSubHeaderChange}
            title={'banner header fields'}
            inputLabelText={'signed in header text'}
            subheaderInputLabelText={'signed in subheader text'}
          />
        }
        outletSectionStart={
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionStart"
            bannerLayout={
              mockLocalSettings.banner_layout ?? 'full_width_banner_layout'
            }
            onChange={onBannerTypeChange}
          />
        }
        bannerMultilocFieldComponent={
          <BannerHeaderMultilocField
            onChange={handleBannerSignedInMultilocOnChange}
            headerMultiloc={mockLocalSettings.banner_signed_in_header_multiloc}
          />
        }
        avatarsFieldComponent={
          <AvatarsField
            checked={mockLocalSettings.banner_avatars_enabled}
            onChange={handleOnChangeBannerAvatarsEnabled}
          />
        }
        outletSectionEnd={
          <Outlet
            id="app.containers.Admin.settings.customize.headerSectionEnd"
            banner_cta_signed_in_text_multiloc={
              mockLocalSettings.banner_cta_signed_in_text_multiloc
            }
            banner_cta_signed_in_url={
              mockLocalSettings.banner_cta_signed_in_url
            }
            // @ts-ignore
            banner_cta_signed_in_type={
              mockLocalSettings.banner_cta_signed_in_type
            }
            banner_cta_signed_out_text_multiloc={
              mockLocalSettings.banner_cta_signed_out_text_multiloc
            }
            banner_cta_signed_out_url={
              mockLocalSettings.banner_cta_signed_out_url
            }
            // @ts-ignore
            banner_cta_signed_out_type={
              mockLocalSettings.banner_cta_signed_out_type
            }
            handleOnChange={handleOnChange}
          />
        }
      />
    );

    // toggle avatar display from true to false
    await act(async () => {
      fireEvent.click(screen.getByText('Display avatars'));
    });

    // change text for various properties
    await act(async () => {
      const registeredHeaderInput = screen.getByDisplayValue(
        'current header text'
      );
      fireEvent.change(registeredHeaderInput, {
        target: { value: 'Signed in header updated' },
      });
    });

    await act(async () => {
      const registeredHeaderInput = screen.getByDisplayValue(
        'current subheader text'
      );
      fireEvent.change(registeredHeaderInput, {
        target: { value: 'Signed in header updated' },
      });
    });

    expect(handleOnChangeBannerAvatarsEnabled).toHaveBeenCalledWith(false);
    expect(onHeaderChange).toHaveBeenCalledWith({
      en: 'Signed in header updated',
    });
    expect(onSubHeaderChange).toHaveBeenCalledWith({
      en: 'Signed in header updated',
    });
  });
});
