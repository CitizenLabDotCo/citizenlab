import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import AdminProjectTemplates from './admin/containers';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.project.edit.permissions': (props) => (
      <AdminProjectTemplates />
    ),
  },
};

export default configuration;
