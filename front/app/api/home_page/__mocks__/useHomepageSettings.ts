import { IHomepageSettingsData } from 'api/home_page/types';

export const mockHomepageSettingsData: IHomepageSettingsData = {
  id: '1',
  type: 'home_page',
  attributes: {
    top_info_section_enabled: true,
    bottom_info_section_enabled: true,
    banner_avatars_enabled: true,
    projects_enabled: true,
    events_widget_enabled: true,
    banner_layout: 'full_width_banner_layout',
    banner_signed_out_header_multiloc: { en: 'Signed out header' },
    banner_signed_out_subheader_multiloc: { en: 'Signed out subhead' },
    banner_signed_in_header_multiloc: { en: 'Signed in header' },
    header_bg: {
      small: 'https://example.com/image.png',
      medium: 'https://example.com/image.png',
      large: 'https://example.com/image.png',
    },
    top_info_section_multiloc: {},
    bottom_info_section_multiloc: {},
    projects_header_multiloc: {},
    banner_signed_out_header_overlay_color: null,
    banner_signed_out_header_overlay_opacity: null,
    pinned_admin_publication_ids: ['pinnedAdminPubId1', 'pinnedAdminPubId2'],
    banner_cta_signed_in_text_multiloc: {},
    banner_cta_signed_in_type: 'no_button',
    banner_cta_signed_in_url: null,
    banner_cta_signed_out_text_multiloc: {},
    banner_cta_signed_out_type: 'no_button',
    banner_cta_signed_out_url: null,
  },
};

export default jest.fn(() => {
  return { data: { data: mockHomepageSettingsData } };
});
