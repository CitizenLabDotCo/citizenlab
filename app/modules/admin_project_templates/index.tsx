import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CreateProject from './admin';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.projects.all.createProject': (_props) => (
      <CreateProject />
    ),
  },
};

export default configuration;
