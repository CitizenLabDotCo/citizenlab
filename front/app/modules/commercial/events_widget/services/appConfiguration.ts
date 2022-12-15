import 'services/appConfiguration';
import { Multiloc } from 'typings';

declare module 'services/appConfiguration' {
  export interface IAppConfigurationSettings {
    // the enabled value needs to be checked in homepageSettings
    // (with e.g. useHomepageSettingsFeatureFlag)
    events_widget?: {
      allowed: boolean;
      widget_title?: Multiloc;
    };
  }
}
