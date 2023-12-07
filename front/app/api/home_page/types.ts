import { Keys } from 'utils/cl-react-query/types';
import homepageSettingsKeys from './keys';
import { SerializedNode } from '@craftjs/core';

export type HomepageSettingsKeys = Keys<typeof homepageSettingsKeys>;

export type THomepageBannerLayout =
  THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

export interface IHomepageSettings {
  data: IHomepageSettingsData;
}

export interface IHomepageSettingsData {
  id: string;
  type: 'home_page';
  attributes: IHomepageSettingsAttributes;
}

export interface IHomepageSettingsAttributes {
  // content builder
  craftjs_json?: Record<string, SerializedNode>;
}

export interface THomepageBannerLayoutMap {
  full_width_banner_layout: 'full_width_banner_layout';
  two_column_layout: 'two_column_layout';
  two_row_layout: 'two_row_layout';
  fixed_ratio_layout: 'fixed_ratio_layout';
}

interface CTASignedInTypeMap {
  customized_button: 'customized_button';
  no_button: 'no_button';
}

export type CTASignedInType = CTASignedInTypeMap[keyof CTASignedInTypeMap];

interface CTASignedOutTypeMap {
  sign_up_button: 'sign_up_button';
  customized_button: 'customized_button';
  no_button: 'no_button';
}
export type CTASignedOutType = CTASignedOutTypeMap[keyof CTASignedOutTypeMap];
