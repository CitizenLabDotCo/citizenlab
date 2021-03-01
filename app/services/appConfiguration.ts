import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';

export const currentAppConfigurationEndpoint = `${API_PATH}/app_configuration`;

interface AppConfigurationFeature {
  allowed: boolean;
  enabled: boolean;
}

export type ISuccessStory = {
  image_url: string;
  location: string;
  page_slug: string;
};
export type AppConfigurationSettingsFeatureNames = keyof IAppConfigurationSettings;

export interface IAppConfigurationSettings {
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
    minimum_length?: number;
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
  manual_project_sorting?: AppConfigurationFeature;
  admin_project_templates?: AppConfigurationFeature;
  pages?: AppConfigurationFeature;
  private_projects?: AppConfigurationFeature;
  maps?: AppConfigurationMapSettings;
  participatory_budgeting?: AppConfigurationFeature;
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
  idea_custom_fields?: AppConfigurationFeature;
  user_custom_fields?: AppConfigurationFeature;
  volunteering?: AppConfigurationFeature;
  workshops?: AppConfigurationFeature;
  ideas_overview?: AppConfigurationFeature;
  smart_groups?: AppConfigurationFeature;
  manual_emailing?: AppConfigurationFeature;
  automated_emailing_control?: AppConfigurationFeature;
  typeform_surveys?: {
    allowed: boolean;
    enabled: boolean;
    user_token: string;
  };
  surveys?: AppConfigurationFeature;
  google_forms_surveys?: AppConfigurationFeature;
  surveymonkey_surveys?: AppConfigurationFeature;
  enalyzer_surveys?: AppConfigurationFeature;
  project_folders?: AppConfigurationFeature;
  clustering?: AppConfigurationFeature;
  geographic_dashboard?: AppConfigurationFeature;
  widgets?: AppConfigurationFeature;
  granular_permissions?: AppConfigurationFeature;
  ideaflow_social_sharing?: AppConfigurationFeature;
  initiativeflow_social_sharing?: AppConfigurationFeature;
  machine_translations?: AppConfigurationFeature;
  custom_topics?: AppConfigurationFeature;
  similar_ideas?: AppConfigurationFeature;
  polls?: AppConfigurationFeature;
  moderation?: AppConfigurationFeature;
  disable_downvoting?: AppConfigurationFeature;
  project_visibility?: AppConfigurationFeature;
  project_management?: AppConfigurationFeature;
  idea_assignment?: AppConfigurationFeature;
  custom_idea_statuses?: AppConfigurationFeature;
  idea_custom_copy?: AppConfigurationFeature;
  intercom?: AppConfigurationFeature;
  satismeter?: AppConfigurationFeature & {
    write_key: string;
  };
  google_analytics?: AppConfigurationFeature & {
    tracking_id: string;
  };
  segment?: AppConfigurationFeature & {
    destinations: string;
  };
  google_tag_manager?: AppConfigurationFeature & {
    destinations: string;
    container_id: string;
  };
  matomo?: AppConfigurationFeature;
  redirects?: {
    enabled: boolean;
    allowed: boolean;
    rules: {
      path: string;
      target: string;
    }[];
  };
}

interface AppConfigurationMapSettings extends AppConfigurationFeature {
  map_center: {
    lat: string;
    long: string;
  };
  tile_provider: string;
  zoom_level: number;
}

export interface IAppConfigurationStyle {
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

export interface IAppConfigurationAttributes {
  name: string;
  host: string;
  settings: IAppConfigurationSettings;
  logo: ImageSizes | null;
  header_bg: ImageSizes | null;
  favicon?: ImageSizes | null;
  style?: IAppConfigurationStyle;
  homepage_info?: Multiloc;
}

export interface IAppConfigurationData {
  id: string;
  type: string;
  attributes: IAppConfigurationAttributes;
}

export interface IAppConfiguration {
  data: IAppConfigurationData;
}

export interface IUpdatedAppConfigurationProperties {
  settings?: Partial<
    {
      [P in keyof IAppConfigurationSettings]: Partial<
        IAppConfigurationSettings[P]
      >;
    }
  >;
  logo?: string;
  header_bg?: string;
  favicon?: string;
}

export function currentAppConfigurationStream() {
  return streams.get<IAppConfiguration>({
    apiEndpoint: currentAppConfigurationEndpoint,
  });
}

export async function updateAppConfiguration(
  object: IUpdatedAppConfigurationProperties
) {
  const tenant = await streams.update<IAppConfiguration>(
    currentAppConfigurationEndpoint,
    'app_configuration',
    { app_configuration: object }
  );
  await currentAppConfigurationStream().fetch();
  return tenant;
}
