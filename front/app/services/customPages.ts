import { API_PATH } from 'containers/App/constants';
import { ImageSizes, Multiloc } from 'typings';
import streams from 'utils/streams';
import { THomepageBannerLayout } from './homepageSettings';

export interface ICustomPage {
  data: ICustomPageData;
}

export interface ICustomPageData {
  id: string;
  attributes: ICustomPageAttributes;
}

export type TCustomPageEnabledSetting = keyof ICustomPageEnabledSettings;

export type TCustomPageBannerLayout =
  | 'full_width_banner_layout'
  | 'two_column_layout'
  | 'two_row_layout';

export type TCustomPageCTAType = 'customized_button' | 'no_button';

export interface ICustomPageEnabledSettings {
  banner_enabled: boolean;
  bottom_info_section_enabled: boolean;
  top_info_section_enabled: boolean;
  events_widget_enabled: boolean;
  files_section_enabled: boolean;

  // for a subsequent iteration
  // projects_enabled: boolean;
}

export interface ICustomPageAttributes extends ICustomPageEnabledSettings {
  title_multiloc: Multiloc;
  top_info_section_multiloc: Multiloc;
  slug: string;
  banner_layout: THomepageBannerLayout | null;
  banner_overlay_color: string | null;
  banner_overlay_opacity: number | null;
  banner_cta_button_multiloc: Multiloc;
  // check if this can be null
  banner_cta_button_type: 'customized_button' | 'no_button';
  banner_cta_button_url: string | null;
  banner_header_multiloc: Multiloc;
  banner_subheader_multiloc: Multiloc;
  bottom_info_section_multiloc: Multiloc;
  header_bg: ImageSizes | null;

  // check on this one
  code: string;
  // not sure about these
  // pinned_admin_publication_ids: string[],
  // static_page_file_id: string,

  // for a subsequent iteration
  projects_filter_type: 'area' | 'projects';
}

const customPagesEndpoint = `${API_PATH}/static_pages`;

export function createCustomPage(pageData: { title_multiloc: Multiloc }) {
  return streams.add<ICustomPage>(customPagesEndpoint, pageData);
}

export function customPageByIdStream(customPageId: string) {
  return streams.get<ICustomPage>({
    apiEndpoint: `${customPagesEndpoint}/${customPageId}`,
  });
}

export async function updateCustomPage(
  customPageId: string,
  updatedPageSettings: Partial<ICustomPageAttributes>
) {
  const customPageSettings = await streams.update(
    `${customPagesEndpoint}/${customPageId}`,
    customPageId,
    { static_page: updatedPageSettings }
  );
  return customPageSettings;
}
