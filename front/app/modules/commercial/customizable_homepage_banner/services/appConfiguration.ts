import 'services/appConfiguration';
import { Multiloc } from 'typings';

declare module 'services/appConfiguration' {
  interface CustomizedButtonConfig {
    text: Multiloc;
    url: string;
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      cta_signed_out_customized_button?: CustomizedButtonConfig;
      cta_signed_in_customized_button?: CustomizedButtonConfig;
    };
  }
}
