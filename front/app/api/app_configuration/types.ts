import { ImageSizes, Multiloc, SupportedLocale, UploadFile } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { TCategory } from 'components/ConsentManager/destinations';

import { Keys } from 'utils/cl-react-query/types';

import appConfigurationKeys from './keys';
export const currentAppConfigurationEndpoint = `${API_PATH}/app_configuration`;

export type AppConfigurationKeys = Keys<typeof appConfigurationKeys>;

interface AppConfigurationFeature {
  allowed: boolean;
  enabled: boolean;
}

export type IAppConfigurationSettingsCore = {
  allowed: boolean;
  enabled: boolean;
  locales: SupportedLocale[];
  population: number | null;
  weglot_api_key: string | null;
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
  meta_title?: Multiloc | null;
  meta_description?: Multiloc | null;
  google_search_console_meta_attribute?: string | null;
  signup_helper_text?: Multiloc | null;
  custom_fields_signup_helper_text?: Multiloc | null;
  color_main: string | null;
  color_secondary: string | null;
  color_text: string | null;
  color_menu_bg?: string | null;
  currency: TCurrency;
  reply_to_email: string;
  segment_destinations_blacklist: string[] | null;
  areas_term?: Multiloc;
  area_term?: Multiloc;
  topics_term?: Multiloc;
  topic_term?: Multiloc;
  authentication_token_lifetime_in_days: number;
  maximum_admins_number: TSeatNumber;
  maximum_moderators_number: TSeatNumber;
  additional_admins_number: TSeatNumber;
  additional_moderators_number: TSeatNumber;
  onboarding?: boolean;
  allow_sharing: boolean;
  customer_portal_url?: string | null;
  anonymous_name_scheme?: string | null;
  private_attributes_in_export: boolean;
  country_code: string | null;
};

export type TSeatNumber = number | null | undefined;

export type ProposalsSettings = {
  allowed: boolean;
  enabled: boolean;
  require_review?: boolean;
  require_cosponsors?: boolean;
  cosponsors_number?: number;
  days_limit: number;
  allow_anonymous_participation?: boolean;
  eligibility_criteria: Multiloc;
  posting_tips: Multiloc;
  threshold_reached_message: Multiloc;
  reacting_threshold: number;
};

export interface IAppConfigurationSettings {
  core: IAppConfigurationSettingsCore;
  advanced_custom_pages: {
    allowed: boolean;
    enabled: boolean;
  };
  pages: {
    allowed: boolean;
    enabled: boolean;
  };
  password_login?: {
    allowed: boolean;
    enabled: boolean;
    enable_signup: boolean;
    minimum_length?: number;
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
    visibility?: 'show' | 'link' | 'hide';
  };
  azure_ad_b2c_login?: {
    allowed: boolean;
    enabled: boolean;
    tenant_name: string;
    tenant_id: string;
    policy_name: string;
    client_id: string;
    logo_url: string;
    login_mechanism_name: string;
  };
  franceconnect_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  clave_unica_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  hoplr_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  id_austria_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  criipto_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  keycloak_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  twoday_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  nemlog_in_login?: {
    allowed: boolean;
    enabled: boolean;
  };
  custom_accessibility_statement_link: {
    allowed: boolean;
    enabled: boolean;
    url?: string;
  };
  maps?: AppConfigurationMapSettings;
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
  smart_groups?: AppConfigurationFeature;
  typeform_surveys?: {
    allowed: boolean;
    enabled: boolean;
    user_token: string;
  };
  surveys?: AppConfigurationFeature;
  google_forms_surveys?: AppConfigurationFeature;
  surveymonkey_surveys?: AppConfigurationFeature;
  enalyzer_surveys?: AppConfigurationFeature;
  qualtrics_surveys?: AppConfigurationFeature;
  smart_survey_surveys?: AppConfigurationFeature;
  microsoft_forms_surveys?: AppConfigurationFeature;
  survey_xact_surveys?: AppConfigurationFeature;
  snap_survey_surveys?: AppConfigurationFeature;
  project_folders?: AppConfigurationFeature;
  project_preview_link?: AppConfigurationFeature;
  bulk_import_ideas?: AppConfigurationFeature;
  granular_permissions?: AppConfigurationFeature;
  machine_translations?: AppConfigurationFeature;
  polls?: AppConfigurationFeature;
  moderation?: AppConfigurationFeature;
  flag_inappropriate_content?: AppConfigurationFeature;
  disable_disliking?: AppConfigurationFeature;
  blocking_profanity?: AppConfigurationFeature;
  anonymous_participation?: AppConfigurationFeature;
  form_mapping?: AppConfigurationFeature;
  custom_idea_statuses?: AppConfigurationFeature;
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
    category: TCategory;
  };
  matomo?: AppConfigurationFeature & {
    tenant_site_id: string;
    product_site_id: string;
  };
  redirects?: AppConfigurationFeature & {
    rules: {
      path: string;
      target: string;
    }[];
  };
  esri_integration?: AppConfigurationFeature & {
    api_key: string;
  };
  disable_user_bios?: AppConfigurationFeature;
  project_description_builder?: AppConfigurationFeature;
  remove_vendor_branding?: AppConfigurationFeature;
  user_confirmation?: AppConfigurationFeature;
  permissions_custom_fields?: AppConfigurationFeature;
  input_form_custom_fields?: AppConfigurationFeature;
  report_builder?: AppConfigurationFeature;
  report_data_grouping?: AppConfigurationFeature;
  posthog_integration?: AppConfigurationFeature;
  posthog_user_tracking?: AppConfigurationFeature;
  user_blocking?: AppConfigurationFeature & {
    duration: boolean;
  };
  internal_commenting?: AppConfigurationFeature;
  follow?: AppConfigurationFeature;
  konveio_document_annotation?: AppConfigurationFeature;
  public_api_tokens?: AppConfigurationFeature;
  power_bi?: AppConfigurationFeature;
  analysis?: AppConfigurationFeature;
  large_summaries?: AppConfigurationFeature;
  ask_a_question?: AppConfigurationFeature;
  advanced_autotagging?: AppConfigurationFeature;
  auto_insights?: AppConfigurationFeature;
  import_printed_forms?: AppConfigurationFeature;
  input_importer?: AppConfigurationFeature;
  user_session_recording?: AppConfigurationFeature;
  user_avatars?: AppConfigurationFeature;
  multi_language_platform?: AppConfigurationFeature;
  customisable_homepage_banner?: AppConfigurationFeature;
  management_feed?: AppConfigurationFeature;
  fake_sso?: AppConfigurationFeature;
  prescreening?: AppConfigurationFeature;
  prescreening_ideation?: AppConfigurationFeature;
  input_cosponsorship?: AppConfigurationFeature;
  project_review?: AppConfigurationFeature;
  input_iq?: AppConfigurationFeature;
  platform_templates?: AppConfigurationFeature;
  authoring_assistance_prototype?: AppConfigurationFeature;
  project_library?: AppConfigurationFeature;
  community_monitor?: AppConfigurationFeature & {
    project_id: string;
  };
  user_fields_in_surveys?: AppConfigurationFeature;
  html_pdfs?: AppConfigurationFeature;
  project_planning?: AppConfigurationFeature;
}

export type TAppConfigurationSettingCore = keyof IAppConfigurationSettingsCore;

export type TAppConfigurationSetting = keyof IAppConfigurationSettings;

export interface AppConfigurationMapSettings extends AppConfigurationFeature {
  map_center: {
    lat: string;
    long: string;
  };
  tile_provider: string;
  zoom_level: number;
}

export interface IAppConfigurationStyle {
  invertedNavbarColors?: boolean;
  navbarBackgroundColor?: string;
  navbarActiveItemBackgroundColor?: string;
  navbarActiveItemBorderColor?: string;
  navbarTextColor?: string;
  navbarHighlightedItemBackgroundColor?: string;
  navbarBorderColor?: string;
  signedOutHeaderTitleFontSize?: number;
  signedOutHeaderTitleFontWeight?: number;
  customFontName?: string;
  customFontAdobeId?: string;
  customFontURL?: string;
  projectNavbarBackgroundColor?: string;
  projectNavbarTextColor?: string;
  projectNavbarIdeaButtonBackgroundColor?: string;
  projectNavbarIdeaButtonTextColor?: string;
}

interface IAppConfigurationAttributes {
  name: string;
  host: string;
  settings: IAppConfigurationSettings;
  logo: ImageSizes | null;
  favicon?: ImageSizes | null;
  style?: IAppConfigurationStyle;
  created_at: string;
}

export interface IAppConfigurationData {
  id: string;
  type: string;
  attributes: IAppConfigurationAttributes;
}

export type TCurrency = TCustomCurrency | TCountryCurrency;
type TCustomCurrency =
  // token, credit
  'TOK' | 'CRE';
export type TCountryCurrency =
  // currencies associated with countries, e.g. EUR and USD
  // list is based on the currencies.rb file
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AWG'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BOV'
  | 'BRL'
  | 'BSD'
  | 'BTN'
  | 'BWP'
  | 'BYR'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHE'
  | 'CHF'
  | 'CHW'
  | 'CLF'
  | 'CLP'
  | 'CNY'
  | 'COP'
  | 'COU'
  | 'CRC'
  | 'CUC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'GBP'
  | 'GEL'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LTL'
  | 'LVL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRO'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MXV'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIO'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'SSP'
  | 'STD'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'USN'
  | 'USS'
  | 'UYI'
  | 'UYU'
  | 'UZS'
  | 'VEF'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XAG'
  | 'XAU'
  | 'XBA'
  | 'XBB'
  | 'XBC'
  | 'XBD'
  | 'XCD'
  | 'XDR'
  | 'XFU'
  | 'XOF'
  | 'XPD'
  | 'XPF'
  | 'XPT'
  | 'XTS'
  | 'XXX'
  | 'YER'
  | 'ZAR'
  | 'ZMW';

export interface IAppConfiguration {
  data: IAppConfigurationData;
}

export interface IUpdatedAppConfigurationProperties {
  settings?: Partial<{
    [P in keyof IAppConfigurationSettings]: Partial<
      IAppConfigurationSettings[P]
    >;
  }>;
  logo?: UploadFile;
  favicon?: string;
  style?: IAppConfigurationStyle;
}
