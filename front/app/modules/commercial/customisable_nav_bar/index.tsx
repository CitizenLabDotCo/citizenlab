import React from 'react';
import PagesOverview from './admin/PagesOverview';

export default {
  outlets: {
    'app.containers.Admin.settings.pages.Overview': ({ onData }) => {
      onData(true);

      return <PagesOverview />;
    },
  },
};
