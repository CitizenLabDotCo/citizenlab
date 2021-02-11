import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';

export const currentTenantApiEndpoint = `${API_PATH}/app_configuration`;

interface TenantFeature {
  allowed: boolean;
  enabled: boolean;
}

export type ISuccessStory = {
  image_url: string;
  location: string;
  page_slug: string;
};
export type TenantSettingsFeatureNames = keyof ITenantSettings;

export interface ITenantSettings {
  core: {
    allowed: boolean;
    enabled: boolean;
    locales: Locale[];
    timezone: string;
    organization_name: Multiloc;
    organization_site?: string;
    organization_type: 'small_city' | 'medium_city' | 'large_city' | 'generic';
    lifecycle_stage:
      | 'trial'
      | 'expired_trial'
      | 'demo'
      | 'active'
      | 'churned'
      | 'not_applicable';
    header_title?: Multiloc | null;
    header_slogan?: Multiloc | null;
    meta_title?: Multiloc | null;
    meta_description?: Multiloc | null;
    signup_helper_text?: Multiloc | null;
    custom_fields_signup_helper_text?: Multiloc | null;
    color_main: string | null;
    color_secondary: string | null;
    color_text: string | null;
    color_menu_bg?: string | null;
    currency: string;
    custom_onboarding_fallback_message?: Multiloc | null;
    /* following three are used in the back-end */
    custom_onboarding_message?: Multiloc | null;
    custom_onboarding_button?: Multiloc | null;
    custom_onboarding_link?: string | null;
    currently_working_on_text?: Multiloc | null;
    segment_destinations_blacklist: string[] | null;
    areas_term?: Multiloc;
    area_term?: Multiloc;
  };
  demographic_fields?: {
    allowed: boolean;
    enabled: boolean;
    gender: boolean;
    birthyear: boolean;
    domicile: boolean;
    education: boolean;
  };
  password_login?: {
    allowed: boolean;
    enabled: boolean;
    phone?: boolean;
    phone_email_pattern?: string;
  };
  facebook_login?: {
    allowed: boolean;
    app_id: string;
    app_secret?: string;
    enabled: boolean;
  };
  google_login?: {
    allowed: boolean;
    client_id: string;
    enabled: boolean;
  };
  azure_ad_login?: {
    allowed: boolean;
    enabled: boolean;
    tenant: string;
    client_id: string;
    logo_url: string;
    login_mechanism_name: string;
  };
  franceconnect_login?: {
    allowed: boolean;
    enabled: boolean;
    environment: string;
    identifier: string;
    secret: string;
  };
  manual_project_sorting?: TenantFeature;
  admin_project_templates?: TenantFeature;
  pages?: TenantFeature;
  private_projects?: TenantFeature;
  maps?: TenantMapSettings;
  participatory_budgeting?: TenantFeature;
  initiatives?: {
    allowed: boolean;
    enabled: boolean;
    days_limit: number;
    eligibility_criteria: Multiloc;
    success_stories?: ISuccessStory[];
    threshold_reached_message: Multiloc;
    voting_threshold: number;
  };
  fragments?: {
    allowed: boolean;
    enabled: boolean;
    enabled_fragments: string[];
  };
  verification?: {
    allowed: boolean;
    enabled: boolean;
    verification_methods: string[];
  };
  idea_custom_fields?: TenantFeature;
  user_custom_fields?: TenantFeature;
  volunteering?: TenantFeature;
  workshops?: TenantFeature;
  ideas_overview?: TenantFeature;
  smart_groups?: TenantFeature;
  manual_emailing?: TenantFeature;
  automated_emailing_control?: TenantFeature;
  typeform_surveys?: {
    allowed: boolean;
    enabled: boolean;
    user_token: string;
  };
  surveys?: TenantFeature;
  google_forms_surveys?: TenantFeature;
  surveymonkey_surveys?: TenantFeature;
  enalyzer_surveys?: TenantFeature;
  project_folders?: TenantFeature;
  clustering?: TenantFeature;
  geographic_dashboard?: TenantFeature;
  widgets?: TenantFeature;
  granular_permissions?: TenantFeature;
  ideaflow_social_sharing?: TenantFeature;
  initiativeflow_social_sharing?: TenantFeature;
  machine_translations?: TenantFeature;
  custom_topics?: TenantFeature;
  similar_ideas?: TenantFeature;
  polls?: TenantFeature;
  moderation?: TenantFeature;
  disable_downvoting?: TenantFeature;
  project_visibility?: TenantFeature;
  project_management?: TenantFeature;
  idea_assignment?: TenantFeature;
  custom_idea_statuses?: TenantFeature;
  idea_custom_copy?: TenantFeature;
  intercom?: TenantFeature;
  satismeter?: TenantFeature & {
    write_key: string;
  };
  google_analytics?: TenantFeature & {
    tracking_id: string;
  };
  segment?: TenantFeature & {
    destinations: string;
  };
  google_tag_manager?: TenantFeature & {
    destinations: string;
    container_id: string;
  };
  redirects?: {
    enabled: boolean;
    allowed: boolean;
    rules: {
      path: string;
      target: string;
    }[];
  };
}

interface TenantMapSettings extends TenantFeature {
  map_center: {
    lat: string;
    long: string;
  };
  tile_provider: string;
  zoom_level: number;
}

export interface ITenantStyle {
  invertedNavbarColors: boolean;
  navbarBackgroundColor?: string;
  navbarActiveItemBackgroundColor?: string;
  navbarActiveItemBorderColor?: string;
  navbarTextColor?: string;
  navbarHighlightedItemBackgroundColor?: string;
  navbarBorderColor?: string;
  signedOutHeaderOverlayColor?: string;
  signedOutHeaderTitleFontSize?: number;
  signedOutHeaderTitleFontWeight?: number;
  signedOutHeaderOverlayOpacity?: number;
  signedInHeaderOverlayColor?: string;
  signedInHeaderOverlayOpacity?: number;
  customFontName?: string;
  customFontAdobeId?: string;
  projectNavbarBackgroundColor?: string;
  projectNavbarTextColor?: string;
  projectNavbarIdeaButtonBackgroundColor?: string;
  projectNavbarIdeaButtonTextColor?: string;
}

export interface ITenantAttributes {
  name: string;
  host: string;
  settings: ITenantSettings;
  logo: ImageSizes | null;
  header_bg: ImageSizes | null;
  favicon?: ImageSizes | null;
  style?: ITenantStyle;
  homepage_info?: Multiloc;
}

export interface ITenantData {
  id: string;
  type: string;
  attributes: ITenantAttributes;
}

export interface ITenant {
  data: ITenantData;
}

export interface IUpdatedTenantProperties {
  settings?: Partial<
    { [P in keyof ITenantSettings]: Partial<ITenantSettings[P]> }
  >;
  logo?: string;
  header_bg?: string;
  favicon?: string;
}

export function currentTenantStream() {
  return streams.get<ITenant>({ apiEndpoint: currentTenantApiEndpoint });
}

export async function updateTenant(
  tenantId: string,
  object: IUpdatedTenantProperties
) {
  const tenant = await streams.update<ITenant>(
    `${API_PATH}/tenants/${tenantId}`,
    tenantId,
    { tenant: object }
  );
  await currentTenantStream().fetch();
  return tenant;
}
