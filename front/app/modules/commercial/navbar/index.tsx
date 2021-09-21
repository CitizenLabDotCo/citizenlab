import React, { useEffect } from 'react';
import CustomisableNavigationSettings from './admin/CustomisableNavigationSettings';
import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.navigation': ({ onMount }) => {
      /* eslint-disable react-hooks/rules-of-hooks */
      useEffect(() => {
        onMount();
        /* eslint-disable react-hooks/exhaustive-deps */
      }, []);

      return <CustomisableNavigationSettings />;
    },
  },
};

export default configuration;
