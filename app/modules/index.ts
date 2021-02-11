import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import smartGroupsConfiguration from './smart_groups';
import userCustomFieldsConfiguration from './user_custom_fields';
import ideaCustomFieldsConfiguration from './idea_custom_fields';
import granularPermissions from './granular_permissions';

import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    isEnabled: true,
  },
  {
    configuration: smartGroupsConfiguration,
    isEnabled: true,
  },
  {
    configuration: userCustomFieldsConfiguration,
    isEnabled: true,
  },
  {
    configuration: ideaCustomFieldsConfiguration,
    isEnabled: true,
  },
  {
    configuration: googleTagManagerConfiguration,
    isEnabled: true,
  },
  {
    configuration: googleAnalyticsConfiguration,
    isEnabled: true,
  },
  {
    configuration: intercomConfiguration,
    isEnabled: true,
  },
  {
    configuration: satismeterConfiguration,
    isEnabled: true,
  },
  {
    configuration: segmentConfiguration,
    isEnabled: true,
  },
  {
    configuration: granularPermissions,
    isEnabled: true,
  },
]);
