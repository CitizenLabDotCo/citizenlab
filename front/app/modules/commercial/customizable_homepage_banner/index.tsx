import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import LayoutSetting from './admin/LayoutSetting';
import TwoColumnLayout from './citizen/TwoColumnLayout';
import TwoRowLayout from './citizen/TwoRowLayout';
import CTASettings from './admin/CTASettings';
import CTA from './citizen/CTA';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useHomepageSettingsFeatureFlag({
    sectionEnabledSettingName: 'customizable_homepage_banner_enabled',
    appConfigSettingName: 'customizable_homepage_banner',
  });

  return featureFlag ? <>{children}</> : null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (props) => {
      return (
        <RenderOnFeatureFlag>
          <LayoutSetting {...props} />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.Admin.settings.customize.headerSectionEnd': (props) => {
      return (
        <RenderOnFeatureFlag>
          <CTASettings {...props} />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.LandingPage.SignedOutHeader.CTA': (props) => {
      return (
        <RenderOnFeatureFlag>
          <CTA signedIn={false} {...props} />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.LandingPage.SignedInHeader.CTA': (props) => {
      return (
        <RenderOnFeatureFlag>
          <CTA signedIn {...props} />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.LandingPage.SignedOutHeader.index': ({
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
