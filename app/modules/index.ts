import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import smartGroupsConfiguration from './smart_groups';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    enabled: true,
  },
  {
    configuration: smartGroupsConfiguration,
    enabled: true,
  },
]);
