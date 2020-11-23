import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    enabled: true,
  },
]);
