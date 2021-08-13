import React, { useEffect } from 'react';
import PagesOverview from './admin/PagesOverview';
import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.pages.Overview': ({ onMount }) => {
      useEffect(() => {
        // onMount(true);
        // temporarily setting this to false for testing purposes
        onMount(false);
      }, []);

      return <PagesOverview />;
    },
  },
};

export default configuration;
