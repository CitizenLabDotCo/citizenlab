import { RouteType } from 'routes';
import { ImageSizes, IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customPagesKeys from './keys';

export type CustomPagesKeys = Keys<typeof customPagesKeys>;

export interface ICustomPage {
  data: ICustomPageData;
}

export interface ICustomPages {
  data: ICustomPageData[];
}

export interface ICustomPageData {
  id: string;
  type: 'static_page';
  attributes: ICustomPageAttributes;
  relationships: {
    nav_bar_item: {
      data: IRelationship | null;
    };
    global_topics: {
      data: IRelationship[];
    };
    areas: {
      data: IRelationship[];
    };
  };
}

export type TCustomPageEnabledSetting = keyof ICustomPageEnabledSettings;

export type TCustomPageBannerLayout =
  | 'full_width_banner_layout'
  | 'two_column_layout'
  | 'two_row_layout'
  | 'fixed_ratio_layout';

export type TCustomPageCTAType = 'customized_button' | 'no_button';

export interface ICustomPageEnabledSettings {
  banner_enabled: boolean;
  bottom_info_section_enabled: boolean;
  top_info_section_enabled: boolean;
  events_widget_enabled: boolean;
  files_section_enabled: boolean;
  projects_enabled: boolean;
}

export type ProjectsFilterTypes = 'no_filter' | 'areas' | 'topics';

export interface ICustomPageAttributes extends ICustomPageEnabledSettings {
  title_multiloc: Multiloc;
  top_info_section_multiloc: Multiloc;
  slug: string;
  banner_layout: TCustomPageBannerLayout;
  banner_overlay_color: string | null;
  banner_overlay_opacity: number | null;
  banner_cta_button_multiloc: Multiloc;
  // check if this can be null
  banner_cta_button_type: 'customized_button' | 'no_button';
  banner_cta_button_url: RouteType | null;
  banner_header_multiloc: Multiloc;
  banner_subheader_multiloc: Multiloc;
  bottom_info_section_multiloc?: Multiloc;
  header_bg: ImageSizes | null;

  code: TCustomPageCode;
  // not sure about these

  projects_filter_type: ProjectsFilterTypes;
  nav_bar_item_title_multiloc: Multiloc;

  created_at: string;
  updated_at: string;
}

export type TPolicyPage =
  | 'cookie-policy'
  | 'privacy-policy'
  | 'terms-and-conditions';

// The cookie policy can't be modified through the application.
// If a custom cookie policy page needs to be created, deleted, or updated,
// it should be requested to the support team. These changes are handled as
// an SLS task since they should be exceptions rather than the norm.
export const EDITABLE_POLICY_PAGES: TPolicyPage[] = [
  'terms-and-conditions',
  'privacy-policy',
];

export type TCustomPageCode =
  // Content of policy pages can only be edited
  // in 'policy' tab in settings (both for non-commercial and
  // commercial customers). Their codes are the same as their slugs.
  | TPolicyPage
  // Everything about 'custom' pages can be changed: their
  // title, navbar name, content and slug.
  | 'custom'
  // 'about' is just a custom page in the end, with a different page code (legacy)
  | 'about'
  | 'faq';
