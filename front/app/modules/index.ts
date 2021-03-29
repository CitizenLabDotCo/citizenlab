import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './commercial/project_folders';
import smartGroupsConfiguration from './commercial/smart_groups';
import userCustomFieldsConfiguration from './commercial/user_custom_fields';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import moderationConfiguration from './commercial/moderation';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import geographicDashboardConfiguration from './commercial/geographic_dashboard';

import customMapsConfiguration from './commercial/custom_maps';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import intercomConfiguration from './commercial/intercom';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import matomoConfiguration from './commercial/matomo';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';
import verificationConfiguration from './commercial/verification';
import customTopicsConfiguration from './commercial/custom_topics';

import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idCowConfiguration from './commercial/id_cow';
import idBogusConfiguration from './commercial/id_bogus';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import IdFranceConnectConfiguration from './commercial/id_franceconnect';
import IdClaveUnicaConfiguration from './commercial/id_clave_unica';

declare var CL_CONFIG: any;

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/project_folders'],
  },
  {
    configuration: smartGroupsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/smart_groups'],
  },
  {
    configuration: userCustomFieldsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/user_custom_fields'],
  },
  {
    configuration: ideaCustomFieldsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/idea_custom_fields'],
  },
  {
    configuration: googleTagManagerConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/google_tag_manager'],
  },
  {
    configuration: matomoConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/matomo'],
  },
  {
    configuration: googleAnalyticsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/google_analytics'],
  },
  {
    configuration: intercomConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/intercom'],
  },
  {
    configuration: satismeterConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/satismeter'],
  },
  {
    configuration: segmentConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/segment'],
  },
  {
    configuration: granularPermissionsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/granular_permissions'],
  },
  {
    configuration: moderationConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/moderation'],
  },
  {
    configuration: ideaAssignmentConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/idea_assignment'],
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_idea_statuses'],
  },
  {
    configuration: customTopicsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_topics'],
  },
  {
    configuration: geographicDashboardConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/geographic_dashboard'],
  },
  {
    configuration: customMapsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_maps'],
  },
  {
    configuration: idBosaFasConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_bosa_fas'],
  },
  {
    configuration: idCowConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_cow'],
  },
  {
    configuration: idBogusConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_bogus'],
  },
  {
    configuration: idIdCardLookupConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_id_card_lookup'],
  },
  {
    configuration: IdFranceConnectConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_franceconnect'],
  },
  {
    configuration: IdClaveUnicaConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_clave_unica'],
  },
  {
    configuration: verificationConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/verification'],
  },
]);
