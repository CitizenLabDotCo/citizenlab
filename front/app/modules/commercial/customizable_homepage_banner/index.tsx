import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import LayoutSetting from './admin/LayoutSetting';
import Layout2 from './citizen/Layout2';
import Layout3 from './citizen/Layout3';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (props) => (
      <LayoutSetting {...props} />
    ),
    'app.containers.LandingPage.SignedOutHeader.index': ({
      homepageBannerLayout,
    }) => {
      if (homepageBannerLayout === 'layout_2') return <Layout2 />;
      if (homepageBannerLayout === 'layout_3') return <Layout3 />;

      return null;
    },
  },
};

export default configuration;
