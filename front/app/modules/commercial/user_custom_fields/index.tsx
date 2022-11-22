import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { IUsersByBirthyear } from './services/stats';

// admin
const CustomFieldGraphs = React.lazy(
  () => import('./admin/components/CustomFieldGraphs')
);

declare module 'resources/GetSerieFromStream' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
  }
}

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboard.reports.ProjectReport.graphs':
      CustomFieldGraphs,
  },
};

export default configuration;
