import React, { useEffect } from 'react';
import PagesOverview from './admin/PagesOverview';
import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.pages.Overview': ({ onMount }) => {
      useEffect(() => {
        onMount();
      }, []);

      return <PagesOverview />;
    },
  },
};

export default configuration;
