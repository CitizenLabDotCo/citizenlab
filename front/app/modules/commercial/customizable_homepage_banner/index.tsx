const LayoutSettingField = React.lazy(
  () =>
    import(
      'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/LayoutSettingField'
    )
);
import React from 'react';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
} from 'services/homepageSettings';
import { ModuleConfiguration } from 'utils/moduleUtils';

declare module 'utils/moduleUtils' {
  export interface OutletsPropertyMap {
    'app.containers.Admin.settings.customize.headerSectionStart': {
      bannerLayout: THomepageBannerLayout;
      onChange: (
        key: keyof IHomepageSettingsAttributes,
        value: THomepageBannerLayout
      ) => void;
    };
  }
}

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': ({
      onChange,
      ...otherProps
    }) => {
      const handleOnChange = (bannerLayout: THomepageBannerLayout) => {
        onChange('banner_layout', bannerLayout);
      };
      return <LayoutSettingField onChange={handleOnChange} {...otherProps} />;
    },
  },
};

export default configuration;
