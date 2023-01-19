import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';

export const currentAppConfigurationEndpoint = `${API_PATH}/app_configuration`;

export interface AppConfigurationFeature {
  allowed: boolean;
  enabled: boolean;
}

export type TAppConfigurationSetting = keyof IAppConfigurationSettings;

// All appConfig setting names except those in THomepageSetting
export type TAppConfigurationSettingWithEnabled = TAppConfigurationSetting;

export type TAppConfigurationSettingCore = keyof IAppConfigurationSettingsCore;

export type IAppConfigurationSettingsCore = {
  allowed: boolean;
  enabled: boolean;
  locales: Locale[];
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
  signup_helper_text?: Multiloc | null;
  custom_fields_signup_helper_text?: Multiloc | null;
  color_main: string | null;
  color_secondary: string | null;
  color_text: string | null;
  color_menu_bg?: string | null;
  currency: TCurrency;
  reply_to_email: string;
  currently_working_on_text?: Multiloc | null;
  segment_destinations_blacklist: string[] | null;
  areas_term?: Multiloc;
  area_term?: Multiloc;
  topics_term?: Multiloc;
  topic_term?: Multiloc;
  authentication_token_lifetime_in_days: number;
};

export type ProposalsSettings = {
  allowed: boolean;
  enabled: boolean;
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
};
export interface IAppConfigurationSettings {
  core: IAppConfigurationSettingsCore;
  advanced_custom_pages: {
    allowed: boolean;
    enabled: boolean;
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
    enable_signup: boolean;
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
  custom_accessibility_statement_link: {
    allowed: boolean;
    enabled: boolean;
    url?: string;
  };
  manual_project_sorting?: AppConfigurationFeature;
  pages?: AppConfigurationFeature;
  project_reports?: AppConfigurationFeature;
  private_projects?: AppConfigurationFeature;
  maps?: AppConfigurationMapSettings;
  participatory_budgeting?: AppConfigurationFeature;
  initiatives?: ProposalsSettings;
  fragments?: {
    allowed: boolean;
    enabled: boolean;
    enabled_fragments: string[];
  };
  idea_custom_fields?: AppConfigurationFeature;
  volunteering?: AppConfigurationFeature;
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
  qualtrics_surveys?: AppConfigurationFeature;
  smart_survey_surveys?: AppConfigurationFeature;
  microsoft_forms_surveys?: AppConfigurationFeature;
  survey_xact_surveys?: AppConfigurationFeature;
  snap_survey_surveys?: AppConfigurationFeature;
  project_folders?: AppConfigurationFeature;
  ideaflow_social_sharing?: AppConfigurationFeature;
  initiativeflow_social_sharing?: AppConfigurationFeature;
  polls?: AppConfigurationFeature;
  disable_downvoting?: AppConfigurationFeature;
  project_visibility?: AppConfigurationFeature;
  project_management?: AppConfigurationFeature;
  idea_author_change?: AppConfigurationFeature;
  idea_custom_copy?: AppConfigurationFeature;
  satismeter?: AppConfigurationFeature & {
    write_key: string;
  };
  redirects?: AppConfigurationFeature & {
    rules: {
      path: string;
      target: string;
    }[];
  };
  disable_user_bios?: AppConfigurationFeature;
  native_surveys?: AppConfigurationFeature;
  user_confirmation?: AppConfigurationFeature;
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
  invertedNavbarColors?: boolean;
  navbarBackgroundColor?: string;
  navbarActiveItemBackgroundColor?: string;
  navbarActiveItemBorderColor?: string;
  navbarTextColor?: string;
  navbarHighlightedItemBackgroundColor?: string;
  navbarBorderColor?: string;
  signedOutHeaderTitleFontSize?: number;
  signedOutHeaderTitleFontWeight?: number;
  // These signed in variables are used via the theme in the
  // component library and can be set via AdminHQ.
  signedInHeaderOverlayColor?: string;
  // Number between 0 and 100, inclusive
  signedInHeaderOverlayOpacity?: number;
  customFontName?: string;
  customFontAdobeId?: string;
  customFontURL?: string;
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
  favicon?: ImageSizes | null;
  style?: IAppConfigurationStyle;
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
  settings?: Partial<{
    [P in keyof IAppConfigurationSettings]: Partial<
      IAppConfigurationSettings[P]
    >;
  }>;
  logo?: string;
  favicon?: string;
  style?: IAppConfigurationStyle;
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

export const coreSettings = (appConfiguration: IAppConfigurationData) =>
  appConfiguration.attributes.settings.core;

type TCurrency = TCustomCurrency | TCountryCurrency;
type TCustomCurrency =
  // token, credit
  'TOK' | 'CRE';
type TCountryCurrency =
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
