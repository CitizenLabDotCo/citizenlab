import { IHomepageBannerSettings } from '.';

// Same as back/config/homepage/default_craftjs.json.erb
const HOMEPAGE_BANNER_DEFAULT_BASE_SETTINGS = {
  banner_layout: 'full_width_banner_layout',
  banner_avatars_enabled: true,
  banner_cta_signed_in_url: '',
  banner_cta_signed_in_type: 'no_button',
  banner_cta_signed_out_url: '',
  banner_cta_signed_out_type: 'sign_up_button',
  banner_signed_in_header_multiloc: {},
  banner_signed_out_header_multiloc: {},
  banner_cta_signed_in_text_multiloc: {},
  banner_cta_signed_out_text_multiloc: {},
  banner_signed_out_subheader_multiloc: {},
  banner_signed_out_header_overlay_opacity: 90,
  banner_signed_in_header_overlay_opacity: 90,
} as const;

export const getHomepageBannerDefaultSettings = (
  overlayColor: string
): IHomepageBannerSettings => ({
  ...HOMEPAGE_BANNER_DEFAULT_BASE_SETTINGS,
  banner_signed_out_header_overlay_color: overlayColor,
  banner_signed_in_header_overlay_color: overlayColor,
});

export const getHomepageBannerDefaultImage = () => ({
  imageUrl:
    'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/header.jpg',
});
