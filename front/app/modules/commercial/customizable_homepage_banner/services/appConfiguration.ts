import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  interface THomepageBannerLayoutMap {
    two_column_layout: 'two_column_layout';
    two_row_layout: 'two_row_layout';
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
    };
  }
}
