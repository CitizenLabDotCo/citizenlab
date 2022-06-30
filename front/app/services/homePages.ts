import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
const homepageSettingsEndpoint = `${API_PATH}/home_pages`;

export interface IHomepageSectionMap {
  customizable_homepage_banner: 'customizable_homepage_banner';
  top_info_section_enabled: 'top_info_section_enabled';
  projects_enabled: 'projects_enabled';
  bottom_info_section_enabled: 'bottom_info_section_enabled';
}

export type THomepageSection = IHomepageSectionMap[keyof IHomepageSectionMap];


export interface IHomepageSettings {
  top_info_section_enabled: boolean;
  top_info_section_multiloc: Multiloc;
  bottom_info_section_enabled: boolean;
  bottom_info_section_multiloc: Multiloc;
  events_widget: boolean;
  projects_enabled: boolean;
  projects_header_multiloc: Multiloc;
  banner_avatars_enabled: boolean;
  customizable_homepage_banner: boolean;
  banner_layout;
  banner_signed_in_header_multiloc: Multiloc;
  cta_signed_in_text_multiloc: Multiloc;
  cta_signed_in_type;
  cta_signed_in_url: string;
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color;
  banner_signed_out_header_overlay_opacity;
  cta_signed_out_text_multiloc: Multiloc;
  cta_signed_out_type;
  cta_signed_out_url: string;
  header_bg;
  pinned_admin_publication_ids: string[];
}

export function homepageSettingsStream() {
  return streams.get<IHomepageSettings>({
    apiEndpoint: homepageSettingsEndpoint,
  });
}
