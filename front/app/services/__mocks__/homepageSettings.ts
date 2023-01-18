import { THomepageBannerLayout } from 'services/homepageSettings';

export const mockHomepageSettings = (
  homepageBannerLayout: THomepageBannerLayout = 'full_width_banner_layout'
) => ({
  attributes: {
    banner_layout: homepageBannerLayout,
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
    // CTA = button/link
    banner_cta_signed_in_text_multiloc: { en: 'Banner CTA signed in text' },
    banner_cta_signed_in_type: 'no_button',
    banner_cta_signed_in_url: null,
    banner_cta_signed_out_text_multiloc: { en: 'Banner CTA signed out text' },
    banner_cta_signed_out_type: 'no_button',
    banner_cta_signed_out_url: null,
    events_widget_enabled: true,
  },
});
