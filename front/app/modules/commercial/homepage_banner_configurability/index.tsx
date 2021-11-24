import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
// dummy component
import Setting1 from './admin/Setting1';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.header_section_end': (_props) => (
      <Setting1 />
    ),
  },
};

export default configuration;
