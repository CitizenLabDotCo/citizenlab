import 'services/appConfiguration';
import { Multiloc } from 'typings';

declare module 'services/appConfiguration' {
  interface THomepageBannerLayoutMap {
    two_column_layout: 'two_column_layout';
    two_row_layout: 'two_row_layout';
  }

  interface CustomizedButtonConfig {
    text: Multiloc;
    url: string;
  }

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
      cta_signed_out_customized_button?: CustomizedButtonConfig;
      cta_signed_in_customized_button?: CustomizedButtonConfig;
    };
  }
}
