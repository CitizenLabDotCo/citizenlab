import { loadModules } from 'utils/moduleUtils';

import projectFolderConfiguration from './projectFolder';

export default loadModules([
  {
    configuration: projectFolderConfiguration,
    enabled: true,
  },
]);
