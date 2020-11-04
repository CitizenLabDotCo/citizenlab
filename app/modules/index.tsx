import React from 'react';
import { loadModules } from 'utils/moduleUtils';

import projectFolderConfiguration from './projectFolder';
import FolderRow from './projectFolder/components/FolderRow';

export default loadModules(
  [
    {
      configuration: projectFolderConfiguration,
      enabled: true,
    },
  ],
  {
    'app.containers.AdminPage.projects.all.projectsAndFolders': [<FolderRow />],
  }
);
