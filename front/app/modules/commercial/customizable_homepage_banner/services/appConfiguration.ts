import { Multiloc } from 'typings';
import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  interface CustomizedButtonConfig {
    text: Multiloc;
    url: string;
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
    };
  }
}
