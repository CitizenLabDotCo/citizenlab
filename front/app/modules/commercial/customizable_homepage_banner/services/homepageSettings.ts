import 'services/homepageSettings';
import { Multiloc } from 'typings';

declare module 'services/homepageSettings' {
  interface CTASignedOutTypeMap {
    sign_up_button: 'sign_up_button';
    customized_button: 'customized_button';
    no_button: 'no_button';
  }
  export type CTASignedOutType = CTASignedOutTypeMap[keyof CTASignedOutTypeMap];

  interface CTASignedInTypeMap {
    customized_button: 'customized_button';
    no_button: 'no_button';
  }
  type CTASignedInType = CTASignedInTypeMap[keyof CTASignedInTypeMap];

  interface THomepageBannerLayoutMap {
    two_column_layout: 'two_column_layout';
    two_row_layout: 'two_row_layout';
  }

  export interface IHomepageSettingsAttributes {
    banner_cta_signed_in_text_multiloc: Multiloc;
    banner_cta_signed_in_type: CTASignedInType;
    banner_cta_signed_in_url: string | null;
    // cta_signed_out
    banner_cta_signed_out_text_multiloc: Multiloc;
    banner_cta_signed_out_type: CTASignedOutType;
    banner_cta_signed_out_url: string | null;
  }
}
