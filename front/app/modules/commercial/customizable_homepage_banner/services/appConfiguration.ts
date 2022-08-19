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
      enabled: boolean;
    };
  }
}
