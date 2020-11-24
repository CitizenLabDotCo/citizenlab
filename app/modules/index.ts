import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import './google_tag_manager';
import './intercom';
import './satismeter';
import './google_analytics';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    enabled: true,
  },
]);
