import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc } from 'typings';
const homepageSettingsEndpoint = `${API_PATH}/home_page`;

// type definitions

// * THomepageSection *
export interface IHomepageSectionMap {
  customizable_homepage_banner: 'customizable_homepage_banner';
  top_info_section_enabled: 'top_info_section_enabled';
  projects_enabled: 'projects_enabled';
  bottom_info_section_enabled: 'bottom_info_section_enabled';
}
export type THomepageSection = IHomepageSectionMap[keyof IHomepageSectionMap];

// * THomepageBannerLayout *
export interface THomepageBannerLayoutMap {
  full_with_banner_layout: 'full_width_banner_layout';
}
export type THomepageBannerLayout =
  THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

export interface IHomepageSettings {
  // To check
  id: string;
  // To check
  type: string;
  attributes: IHomepageSettingsAttributes;
}

export interface IHomepageSettingsAttributes {
  top_info_section_enabled: boolean;
  top_info_section_multiloc: Multiloc;
  bottom_info_section_enabled: boolean;
  bottom_info_section_multiloc: Multiloc;
  events_widget_enabled: boolean;
  projects_enabled: boolean;
  projects_header_multiloc: Multiloc;
  banner_avatars_enabled: boolean;
  customizable_homepage_banner: boolean;
  banner_layout;
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color;
  banner_signed_out_header_overlay_opacity;
  header_bg: ImageSizes | null;
  pinned_admin_publication_ids: string[];
}

// streams
export function homepageSettingsStream() {
  return streams.get<IHomepageSettings>({
    apiEndpoint: homepageSettingsEndpoint,
  });
}

export async function updateHomepageSettings(
  // still to update, won't work for header_bg
  newHomepageSettings: Partial<IHomepageSettings>
) {
  const homepageSettings = await streams.update<IHomepageSettings>(
    homepageSettingsEndpoint,
    // There's only 1 object with homepage settings
    // As opposed to e.g. many ideas. So we can give it a dataId we like.
    'home_page_settings',
    { home_pages: newHomepageSettings }
  );
  // is this needed?
  await homepageSettingsStream().fetch();
  return homepageSettings;
}
