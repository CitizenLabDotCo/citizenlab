import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Granular from './admin/containers/Granular';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions': (props) => (
      <Granular {...props} />
    ),
  },
};

export default configuration;
