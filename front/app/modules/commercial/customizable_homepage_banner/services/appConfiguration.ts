import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  interface THomepageBannerLayoutMap {
    full_width_banner_layout: 'full_width_banner_layout';
    layout_2: 'layout_2';
    layout_3: 'layout_3';
  }

  type THomepageBannerLayout = THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

  export interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
    };
  }
}
