import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  export interface THomepageBannerLayoutMap {
    layout_2: 'layout_2';
    layout_3: 'layout_3';
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
    };
  }
}
