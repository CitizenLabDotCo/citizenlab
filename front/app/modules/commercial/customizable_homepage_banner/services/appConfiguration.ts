import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  // NOT signed in
  interface CTASignedOutButtonMap {
    customized_button: 'customized_button';
    no_button: 'no_button';
  }

  // signed in
  interface CTASignedInButtonMap {
    customized_button: 'customized_button';
    no_button: 'no_button';
  }

  type CTASignedInButton = CTASignedInButtonMap[keyof CTASignedInButtonMap];

  interface IAppConfigurationSettingsCustomizableHomepageBanner {
    // NOT signed in
    call_to_action_not_signed_in_customized_button?: {
      text: string;
      url: string;
    };
    // signed in
    call_to_action_signed_in_selected_option: CTASignedInButton;
    call_to_action_signed_in_customized_button?: {
      text: string;
      url: string;
    };
  }
}
