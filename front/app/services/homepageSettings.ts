import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc } from 'typings';
const homepageSettingsEndpoint = `${API_PATH}/home_page`;

// Enabled values for sections that have a corresponding
// setting in appConfiguration.ts
export type TAppConfigSectionSetting = Extract<
  THomepageEnabledSetting,
  'events_widget_enabled'
>;

// Enabled values for sections that DON'T have a corresponding
// setting in appConfiguration.ts (are regular sections)
export type TSectionSetting = Exclude<
  THomepageEnabledSetting,
  TAppConfigSectionSetting
>;

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
  data: IHomepageSettingsData;
}

export interface IHomepageSettingsData {
  attributes: IHomepageSettingsAttributes;
}

export type THomepageEnabledSetting = keyof IHomepageEnabledSettings;

export interface IHomepageSettingsAttributes extends IHomepageEnabledSettings {
  top_info_section_multiloc: Multiloc;
  bottom_info_section_multiloc: Multiloc;
  projects_header_multiloc: Multiloc;
  banner_layout: THomepageBannerLayout | null;
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_out_header_overlay_opacity: number | null;
  header_bg: ImageSizes | null;
  pinned_admin_publication_ids: string[];
}

export interface IHomepageEnabledSettings {
  top_info_section_enabled: boolean;
  bottom_info_section_enabled: boolean;
  banner_avatars_enabled: boolean;
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
