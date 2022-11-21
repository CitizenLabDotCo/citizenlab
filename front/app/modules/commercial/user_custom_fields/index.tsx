import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  IUsersByBirthyear,
  IUsersByDomicile,
  IUsersByRegistrationField,
} from './services/stats';

// admin
const CustomFieldGraphs = React.lazy(
  () => import('./admin/components/CustomFieldGraphs')
);
const RegistrationFieldsToGraphs = React.lazy(
  () => import('./admin/components/RegistrationFieldsToGraphs')
);
const AllCustomFields = React.lazy(
  () => import('./admin/components/CustomFields/All')
);

const RegistrationQuestions = React.lazy(
  () => import('./admin/components/RegistrationQuestions')
);

declare module 'resources/GetSerieFromStream' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
  }
}

declare module 'containers/Admin/dashboard/users/charts/BarChartByCategory' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
    usersByDomicile: IUsersByDomicile;
  }
}

declare module 'containers/Admin/dashboard/users/charts/HorizontalBarChart' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
    usersByDomicile: IUsersByDomicile;
  }
}

declare module 'containers/Admin/dashboard/users/charts/PieChartByCategory' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
  }
}

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboard.users.graphs': RegistrationFieldsToGraphs,
    'app.containers.Admin.dashboard.reports.ProjectReport.graphs':
      CustomFieldGraphs,
    'app.containers.Admin.settings.registrationTabEnd': AllCustomFields,
    'app.containers.Admin.settings.registrationSectionEnd':
      RegistrationQuestions,
  },
};

export default configuration;
