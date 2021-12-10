import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  interface THomepageBannerLayoutMap {
    full_width_banner_layout: 'full_width_banner_layout';
    two_column_layout: 'two_column_layout';
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
