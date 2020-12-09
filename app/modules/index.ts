import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';

import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    enabled: true,
  },
  {
    configuration: googleTagManagerConfiguration,
    enabled: true,
  },
  {
    configuration: googleAnalyticsConfiguration,
    enabled: true,
  },
  {
    configuration: intercomConfiguration,
    enabled: true,
  },
  {
    configuration: satismeterConfiguration,
    enabled: true,
  },
  {
    configuration: segmentConfiguration,
    enabled: true,
  },
]);
