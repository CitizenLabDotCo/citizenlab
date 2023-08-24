import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './commercial/smart_groups';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import moderationConfiguration from './commercial/moderation';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import machineTranslationsConfiguration from './commercial/machine_translations';
import similarIdeaConfiguration from './commercial/similar_ideas';

import customMapsConfiguration from './commercial/custom_maps';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import intercomConfiguration from './commercial/intercom';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import matomoConfiguration from './commercial/matomo';
import posthogConfiguration from './commercial/posthog_integration';
import projectDescriptionBuilderConfiguration from './commercial/project_description_builder';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';
import bulkIdeaImportConfiguration from './commercial/bulk_idea_import';
import impactTrackingConfiguration from './commercial/impact_tracking';

import idAuth0Configuration from './commercial/id_auth0';
import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idNemLogInConfiguration from './commercial/id_nemlog_in';
import idCowConfiguration from './commercial/id_cow';
import idCriiptoConfiguration from './commercial/id_criipto';
import idBogusConfiguration from './commercial/id_bogus';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import IdFranceConnectConfiguration from './commercial/id_franceconnect';
import IdGentRrnConfiguration from './commercial/id_gent_rrn';
import IdOostendeRrnConfiguration from './commercial/id_oostende_rrn';
import IdClaveUnicaConfiguration from './commercial/id_clave_unica';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

import insightsConfiguration from './commercial/insights';
import analyticsConfiguration from './commercial/analytics';
import representativenessConfiguration from './commercial/representativeness';

import idViennaSamlConfiguration from './commercial/id_vienna_saml';

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
  },
  {
    configuration: googleTagManagerConfiguration,
  },
  {
    configuration: matomoConfiguration,
  },
  {
    configuration: posthogConfiguration,
  },
  {
    configuration: googleAnalyticsConfiguration,
  },
  {
    configuration: intercomConfiguration,
  },
  {
    configuration: satismeterConfiguration,
  },
  {
    configuration: segmentConfiguration,
  },
  {
    configuration: granularPermissionsConfiguration,
  },
  {
    configuration: moderationConfiguration,
  },
  {
    configuration: flagInappropriateContentConfiguration,
  },
  {
    configuration: ideaAssignmentConfiguration,
  },
  {
    configuration: projectDescriptionBuilderConfiguration,
  },
  {
    configuration: customIdeaStatusesConfiguration,
  },
  {
    configuration: bulkIdeaImportConfiguration,
  },
  {
    configuration: adminProjectTemplatesConfiguration,
  },
  {
    configuration: similarIdeaConfiguration,
  },
  {
    configuration: customMapsConfiguration,
  },
  {
    configuration: idAuth0Configuration,
  },
  {
    configuration: idBosaFasConfiguration,
  },
  {
    configuration: idNemLogInConfiguration,
  },
  {
    configuration: idCowConfiguration,
  },
  {
    configuration: idCriiptoConfiguration,
  },
  {
    configuration: idBogusConfiguration,
  },
  {
    configuration: idIdCardLookupConfiguration,
  },
  {
    configuration: IdFranceConnectConfiguration,
  },
  {
    configuration: IdGentRrnConfiguration,
  },
  {
    configuration: IdOostendeRrnConfiguration,
  },
  {
    configuration: IdClaveUnicaConfiguration,
  },
  {
    configuration: machineTranslationsConfiguration,
  },
  {
    configuration: widgetsConfiguration,
  },
  {
    configuration: eventsWidgetConfiguration,
  },
  {
    configuration: insightsConfiguration,
  },
  {
    configuration: analyticsConfiguration,
  },
  {
    configuration: idViennaSamlConfiguration,
  },
  {
    configuration: representativenessConfiguration,
  },
  {
    configuration: impactTrackingConfiguration,
  },
]);
