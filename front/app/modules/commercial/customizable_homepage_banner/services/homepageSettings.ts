import 'services/homepageSettings';

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
}
