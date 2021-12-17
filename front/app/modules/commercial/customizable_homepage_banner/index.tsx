import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import LayoutSetting from './admin/LayoutSetting';
import BannerLayoutHeights from './BannerLayoutHeights';
import TwoColumnLayout from './citizen/TwoColumnLayout';
import TwoRowLayout from './citizen/TwoRowLayout';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (props) => (
      <LayoutSetting {...props} />
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
    'app.containers.Admin.settings.customize.Header.HeaderImageDropzone.end': BannerLayoutHeights,
  },
};

export default configuration;
