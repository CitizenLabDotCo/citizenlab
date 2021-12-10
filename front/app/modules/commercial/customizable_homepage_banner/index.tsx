import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import LayoutSetting from './admin/LayoutSetting';
import TwoColumnLayout from './citizen/TwoColumnLayout';
import Layout3 from './citizen/Layout3';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (props) => (
      <LayoutSetting {...props} />
    ),
    'app.containers.LandingPage.SignedOutHeader.index': ({
      homepageBannerLayout,
    }) => {
      if (homepageBannerLayout === 'two_column_layout')
        return <TwoColumnLayout />;
      if (homepageBannerLayout === 'layout_3') return <Layout3 />;

      return null;
    },
  },
};

export default configuration;
