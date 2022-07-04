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

  export interface IHomepageSettingsAttributes {
    // cta_signed_in
    cta_signed_in_text_multiloc: Multiloc;
    cta_signed_in_type: CTASignedInType;
    cta_signed_in_url: string;
    // cta_signed_out
    cta_signed_out_text_multiloc: Multiloc;
    cta_signed_out_type: CTASignedOutType;
    cta_signed_out_url: string;
  }
}
