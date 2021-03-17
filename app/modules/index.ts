import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import smartGroupsConfiguration from './smart_groups';
import userCustomFieldsConfiguration from './user_custom_fields';
import granularPermissionsConfiguration from './granular_permissions';
import moderationConfiguration from './moderation';
import ideaAssignmentConfiguration from './idea_assignment';
import geographicDashboardConfiguration from './geographic_dashboard';
import customMapsConfiguration from './custom_maps';
import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';
import adminProjectTemplatesConfiguration from './admin_project_templates';
import matomoConfiguration from './matomo';
import customIdeaStatusesConfiguration from './custom_idea_statuses';

import idBosaFasConfiguration from './id_bosa_fas';
import idCowConfiguration from './id_cow';
import idBogusConfiguration from './id_bogus';
import idIdCardLookupConfiguration from './id_id_card_lookup';
import IdFranceConnectConfiguration from './id_franceconnect';
import IdClaveUnicaConfiguration from './id_clave_unica';

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
    configuration: googleTagManagerConfiguration,
    isEnabled: true,
  },
  {
    configuration: matomoConfiguration,
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
    configuration: ideaAssignmentConfiguration,
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
  {
    configuration: adminProjectTemplatesConfiguration,
    isEnabled: true,
  },
  {
    configuration: idBosaFasConfiguration,
    isEnabled: true,
  },
  {
    configuration: idCowConfiguration,
    isEnabled: true,
  },
  {
    configuration: idBogusConfiguration,
    isEnabled: true,
  },
  {
    configuration: idIdCardLookupConfiguration,
    isEnabled: true,
  },
  {
    configuration: IdFranceConnectConfiguration,
    isEnabled: true,
  },
  {
    configuration: IdClaveUnicaConfiguration,
    isEnabled: true,
  },
]);
