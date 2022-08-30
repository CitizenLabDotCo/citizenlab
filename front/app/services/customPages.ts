import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, ImageSizes } from 'typings';
import { THomepageBannerLayout } from './homepageSettings';

export interface ICustomPage {
  data: ICustomPageData;
}

export interface ICustomPageData {
  id: string;
  attributes: ICustomPagesAttributes;
  // type: ''
  // relationships:
}

export interface ICustomPagesAttributes {
  top_info_section_enabled: boolean;
  top_info_section_multiloc: Multiloc;
  slug: string;
  banner_enabled: boolean;
  banner_layout: THomepageBannerLayout | null;
  banner_overlay_color: string | null;
  banner_overlay_opacity: number | null;
  banner_cta_button_multiloc: Multiloc;
  banner_cta_button_type: 'customized_button' | 'no_button' | null;
  banner_cta_button_url: string | null;
  banner_header_multiloc: Multiloc;
  banner_subheader_multiloc: Multiloc;
  files_section_enabled: boolean;
  projects_enabled: boolean;
  // check
  projects_filter_type: 'area' | 'projects';
  events_widget_enabled: boolean;
  bottom_info_section_enabled: boolean;
  bottom_info_section_multiloc: Multiloc;
  header_bg: ImageSizes | null;
  // check on which are possible
  code: string;
  // not sure about these
  // pinned_admin_publication_ids: string[],
  // static_page_file_id: string,
}

const customPagesEndpoint = `${API_PATH}/static_pages`;

export function createCustomPageStream(pageData: { title_multiloc: Multiloc }) {
  return streams.add<ICustomPage>(`${customPagesEndpoint}`, pageData);
}

export function customPageByIdStream(customPageId: string) {
  return streams.get<ICustomPage>({
    apiEndpoint: `${customPagesEndpoint}/${customPageId}`,
  });
}

export async function updateCustomPage(
  customPageId: string,
  // still to update, won't work for header_bg, which has different types when
  // updating vs. getting the data.
  updatedPageSettings
) {
  const customPageSettings = await streams.update(
    `${customPagesEndpoint}/${customPageId}`,
    customPageId,
    { static_page: updatedPageSettings }
  );
  // is this needed?
  return customPageSettings;
}
