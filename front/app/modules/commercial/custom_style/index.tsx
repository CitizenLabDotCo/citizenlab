import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import HeaderImageOverlayInputs from './admin/components/HeaderImageOverlayInputs';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerBgSectionFieldEnd': (
      props
    ) => {
      if (props.layout === 'full_width_banner_layout') {
        return <HeaderImageOverlayInputs {...props} />;
      }

      return null;
    },
  },
};

export default configuration;
