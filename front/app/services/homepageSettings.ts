import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc } from 'typings';
const homepageSettingsEndpoint = `${API_PATH}/home_page`;

// type definitions

export type THomepageAppConfigSetting =
  | 'events_widget'
  | 'customizable_homepage_banner';

// * THomepageSection *
export interface IHomepageSectionMap {
  customizable_homepage_banner_enabled: 'customizable_homepage_banner_enabled';
  top_info_section_enabled: 'top_info_section_enabled';
  projects_enabled: 'projects_enabled';
  bottom_info_section_enabled: 'bottom_info_section_enabled';
}
export type THomepageSection = IHomepageSectionMap[keyof IHomepageSectionMap];

// * THomepageBannerLayout *
export interface THomepageBannerLayoutMap {
  full_width_banner_layout: 'full_width_banner_layout';
}
export type THomepageBannerLayout =
  THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

export interface IHomepageSettings {
  // To check
  id: string;
  // To check
  type: string;
  data: { attributes: IHomepageSettingsAttributes };
}

export type THomepageEnabledSetting = keyof IHomepageEnabledSetting;

export interface IHomepageSettingsAttributes {
  // are these values always there?
  top_info_section_multiloc: Multiloc;
  bottom_info_section_multiloc: Multiloc;
  projects_header_multiloc: Multiloc;
  banner_layout: THomepageBannerLayout | null;
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  // Number between 0 and 100, inclusive
  banner_signed_out_header_overlay_color: string;
  banner_signed_out_header_overlay_opacity: number;
  header_bg: ImageSizes | null;
  pinned_admin_publication_ids: string[];
}

interface IHomepageEnabledSetting extends IHomepageSettingsAttributes {
  top_info_section_enabled: boolean;
  bottom_info_section_enabled: boolean;
  // move to module
  // the allowed of events_widget_enabled still needs to be checked in appConfig
  events_widget_enabled: boolean;
  banner_avatars_enabled: boolean;
  // the allowed of customizable_homepage_banner_enabled still needs to be checked in appConfig
  customizable_homepage_banner_enabled: boolean;
  projects_enabled: boolean;
}

// streams
export function homepageSettingsStream() {
  return streams.get<IHomepageSettings>({
    apiEndpoint: homepageSettingsEndpoint,
  });
}

export async function updateHomepageSettings(
  // still to update, won't work for header_bg, which has different types when
  // updating vs. getting the data.
  newHomepageSettings: Partial<IHomepageSettingsAttributes>
) {
  const homepageSettings = await streams.update<IHomepageSettings>(
    homepageSettingsEndpoint,
    // There's only 1 object with homepage settings
    // As opposed to e.g. many ideas. So we can give it a dataId we like.
    'home_page_settings',
    { home_page: newHomepageSettings }
  );
  // is this needed?
  await homepageSettingsStream().fetch();
  return homepageSettings;
}
