const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));
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
const CTASettings = React.lazy(() => import('./admin/CTASettings'));
const CTA = React.lazy(() => import('./citizen/CTA'));
const TwoColumnLayout = React.lazy(() => import('./citizen/TwoColumnLayout'));
const TwoRowLayout = React.lazy(() => import('./citizen/TwoRowLayout'));

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
    'app.containers.Admin.settings.customize.headerSectionEnd': (props) => {
      return <CTASettings {...props} />;
    },
    'app.containers.HomePage.SignedOutHeader.CTA': (props) => {
      return (
        <FeatureFlag name="customizable_homepage_banner">
          <CTA signedIn={false} {...props} />
        </FeatureFlag>
      );
    },
    'app.containers.HomePage.SignedInHeader.CTA': (props) => {
      return (
        <FeatureFlag name="customizable_homepage_banner">
          <CTA signedIn {...props} />
        </FeatureFlag>
      );
    },
    'app.containers.HomePage.SignedOutHeader.index': ({
      homepageBannerLayout,
    }) => {
      if (homepageBannerLayout === 'two_column_layout') {
        return <TwoColumnLayout />;
      }
      if (homepageBannerLayout === 'two_row_layout') {
        return <TwoRowLayout />;
      }

      return null;
    },
  },
};

export default configuration;
