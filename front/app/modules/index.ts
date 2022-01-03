import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './commercial/project_folders';
import smartGroupsConfiguration from './commercial/smart_groups';
import userCustomFieldsConfiguration from './commercial/user_custom_fields';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import projectManagementConfiguration from './commercial/project_management';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import moderationConfiguration from './commercial/moderation';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import geographicDashboardConfiguration from './commercial/geographic_dashboard';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import machineTranslationsConfiguration from './commercial/machine_translations';
import similarIdeaConfiguration from './commercial/similar_ideas';
import clusteringsConfiguration from './commercial/clusterings';
import customizableHomepageBannerConfiguration from './commercial/customizable_homepage_banner';

import projectVisibilityConfiguration from './free/project_visibility';

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

import idAuth0Configuration from './commercial/id_auth0';
import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idCowConfiguration from './commercial/id_cow';
import idBogusConfiguration from './commercial/id_bogus';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import IdFranceConnectConfiguration from './commercial/id_franceconnect';
import IdGentRrnConfiguration from './commercial/id_gent_rrn';
import IdClaveUnicaConfiguration from './commercial/id_clave_unica';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

import taggingConfiguration from './commercial/tagging';
import insightsConfiguration from './commercial/insights';
import customizableNavbarConfiguration from './commercial/customizable_navbar';

import userConfirmationConfiguration from './free/user_confirmation';

// eslint-disable-next-line no-var
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
    configuration: projectVisibilityConfiguration,
    isEnabled: CL_CONFIG['modules']['free/project_visibility'],
  },
  {
    configuration: projectManagementConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/project_management'],
  },
  {
    configuration: moderationConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/moderation'],
  },
  {
    configuration: flagInappropriateContentConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/flag_inappropriate_content'],
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
    configuration: clusteringsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/clusterings'],
  },
  {
    configuration: customizableHomepageBannerConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/customizable_homepage_banner'],
  },
  {
    configuration: geographicDashboardConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/geographic_dashboard'],
  },
  {
    configuration: adminProjectTemplatesConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/admin_project_templates'],
  },
  {
    configuration: similarIdeaConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/similar_ideas'],
  },
  {
    configuration: customMapsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_maps'],
  },
  {
    configuration: idAuth0Configuration,
    isEnabled: CL_CONFIG['modules']['commercial/id_auth0'],
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
    configuration: IdGentRrnConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_gent_rrn'],
  },
  {
    configuration: IdClaveUnicaConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_clave_unica'],
  },
  {
    configuration: machineTranslationsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/machine_translations'],
  },
  {
    configuration: verificationConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/verification'],
  },
  {
    configuration: widgetsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/widgets'],
  },
  {
    configuration: eventsWidgetConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/events_widget'],
  },
  {
    configuration: taggingConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/tagging'],
  },
  {
    configuration: insightsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/insights'],
  },
  {
    configuration: customizableNavbarConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/customizable_navbar'],
  },
  {
    configuration: userConfirmationConfiguration,
    isEnabled: CL_CONFIG['modules']['free/user_confirmation'],
  },
]);
