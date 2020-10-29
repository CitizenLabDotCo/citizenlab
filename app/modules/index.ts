import { loadModules } from 'utils/moduleUtils';

import projectFolderConfiguration from './project-folder';

export default loadModules([
  {
    configuration: projectFolderConfiguration,
    enabled: true,
  },
]);
