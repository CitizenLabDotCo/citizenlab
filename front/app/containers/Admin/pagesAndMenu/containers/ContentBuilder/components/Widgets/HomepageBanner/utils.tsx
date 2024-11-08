import { IHomepageBannerSettings } from '.';

const HOMEPAGE_BANNER_DEFAULT_BASE_SETTINGS = {
  banner_avatars_enabled: true,
  banner_layout: 'full_width_banner_layout',
  banner_signed_in_header_multiloc: {},
  banner_cta_signed_in_text_multiloc: {},
  banner_cta_signed_in_type: 'no_button',
  banner_cta_signed_in_url: null,
  banner_signed_out_header_multiloc: {},
  banner_signed_out_subheader_multiloc: {},
  // banner_signed_out_header_overlay_color:
  // theme.colors.tenantPrimary,
  banner_signed_out_header_overlay_opacity: 90,
  banner_signed_in_header_overlay_opacity: 90,
  banner_cta_signed_out_text_multiloc: {},
  banner_cta_signed_out_type: 'sign_up_button',
  banner_cta_signed_out_url: null,
} as const;

export const getHomepageBannerDefaultSettings = (
  overlayColor: string
): IHomepageBannerSettings => ({
  ...HOMEPAGE_BANNER_DEFAULT_BASE_SETTINGS,
  banner_signed_out_header_overlay_color: overlayColor,
  banner_signed_in_header_overlay_color: overlayColor,
});
