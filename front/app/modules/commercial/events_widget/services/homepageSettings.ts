import 'services/homepageSettings';

declare module 'services/homepageSettings' {
  interface THomepageSettingKeyMap {
    events_widget: 'events_widget';
  }

  export interface IHomepageSectionMap {
    events_widget_enabled: 'events_widget_enabled';
  }

  export interface IHomepageEnabledSettings {
    // the allowed of events_widget_enabled still needs to be checked in appConfig
    events_widget_enabled: boolean;
  }
}
