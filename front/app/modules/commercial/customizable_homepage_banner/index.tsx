import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import LayoutSetting from './admin/LayoutSetting';
import TwoColumnLayout from './citizen/TwoColumnLayout';
import TwoRowLayout from './citizen/TwoRowLayout';
import FeatureFlag from 'components/FeatureFlag';
import CTASettings from './admin/CTASettings';
import CTA from './citizen/CTA';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (props) => (
      <FeatureFlag name="customizable_homepage_banner">
        <LayoutSetting {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.customize.headerSectionEnd': (props) => (
      <FeatureFlag name="customizable_homepage_banner">
        <CTASettings {...props} />
      </FeatureFlag>
    ),
    'app.containers.LandingPage.SignedOutHeader.CTA': (props) => (
      <FeatureFlag name="customizable_homepage_banner">
        <CTA signedIn={false} {...props} />
      </FeatureFlag>
    ),
    'app.containers.LandingPage.SignedInHeader.CTA': (props) => (
      <FeatureFlag name="customizable_homepage_banner">
        <CTA signedIn {...props} />
      </FeatureFlag>
    ),
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
