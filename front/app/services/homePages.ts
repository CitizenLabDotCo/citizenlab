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

export interface IHomepageSettings {}

export function homepageSettingsStream() {
  return streams.get<IHomepageSettings>({
    apiEndpoint: homepageSettingsEndpoint,
  });
}
