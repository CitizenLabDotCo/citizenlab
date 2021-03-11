import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import smartGroupsConfiguration from './smart_groups';
import granularPermissionsConfiguration from './granular_permissions';
import moderationConfiguration from './moderation';
import geographicDashboardConfiguration from './geographic_dashboard';
import customMapsConfiguration from './custom_maps';
import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';
import projectVisibilityConfiguration from './project_visibility';
import projectManagementConfiguration from './project_management';
import customIdeaStatusesConfiguration from './custom_idea_statuses';

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
    configuration: granularPermissionsConfiguration,
    isEnabled: true,
  },
  {
    configuration: moderationConfiguration,
    isEnabled: true,
  },
  {
    configuration: projectVisibilityConfiguration,
    isEnabled: true,
  },
  {
    configuration: projectManagementConfiguration,
    isEnabled: true,
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled: true,
  },
  {
    configuration: geographicDashboardConfiguration,
    isEnabled: true,
  },
  {
    configuration: customMapsConfiguration,
    isEnabled: true,
  },
]);
