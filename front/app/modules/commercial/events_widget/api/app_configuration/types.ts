import 'api/app_configuration/types';
import { Multiloc } from 'typings';

declare module 'api/app_configuration/types' {
  export interface IAppConfigurationSettings {
    // the enabled value needs to be checked in homepageSettings
    // (with e.g. useHomepageSettingsFeatureFlag)
    events_widget?: {
      allowed: boolean;
      widget_title?: Multiloc;
    };
  }
}
