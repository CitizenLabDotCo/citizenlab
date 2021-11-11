import 'services/appConfiguration';
import { Multiloc } from 'typings';

declare module 'services/appConfiguration' {
  interface THomepageBannerLayoutMap {
    two_column_layout: 'two_column_layout';
    two_row_layout: 'two_row_layout';
  }

  interface CTASignedOutTypeMap {
    sign_up_button: 'sign_up_button';
    customized_button: 'customized_button';
    no_button: 'no_button';
  }
  type CTASignedOutType = CTASignedOutTypeMap[keyof CTASignedOutTypeMap];

  interface CTASignedInTypeMap {
    customized_button: 'customized_button';
    no_button: 'no_button';
  }
  type CTASignedInType = CTASignedInTypeMap[keyof CTASignedInTypeMap];

  interface CustomizedButtonConfig {
    text: Multiloc;
    url: string;
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
      cta_signed_out_type: CTASignedOutType;
      cta_signed_out_customized_button?: CustomizedButtonConfig;
      cta_signed_in_type: CTASignedInType;
      cta_signed_in_customized_button?: CustomizedButtonConfig;
    };
  }
}
