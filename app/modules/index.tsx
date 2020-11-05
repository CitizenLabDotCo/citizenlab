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
    'app.containers.AdminPage.projects.all.projectsAndFolders.row': [
      (props) =>
        props.publication.publicationType === 'project_folder' && (
          <FolderRow {...props} />
        ),
    ],
  }
);
