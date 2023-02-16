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
import idCowConfiguration from './commercial/id_cow';
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

// eslint-disable-next-line no-var
declare var CITIZENLAB_EE: string;

const isEnabled = CITIZENLAB_EE === 'true';

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
    isEnabled,
  },
  {
    configuration: googleTagManagerConfiguration,
    isEnabled,
  },
  {
    configuration: matomoConfiguration,
    isEnabled,
  },
  {
    configuration: posthogConfiguration,
    isEnabled,
  },
  {
    configuration: googleAnalyticsConfiguration,
    isEnabled,
  },
  {
    configuration: intercomConfiguration,
    isEnabled,
  },
  {
    configuration: satismeterConfiguration,
    isEnabled,
  },
  {
    configuration: segmentConfiguration,
    isEnabled,
  },
  {
    configuration: granularPermissionsConfiguration,
    isEnabled,
  },
  {
    configuration: moderationConfiguration,
    isEnabled,
  },
  {
    configuration: flagInappropriateContentConfiguration,
    isEnabled,
  },
  {
    configuration: ideaAssignmentConfiguration,
    isEnabled,
  },
  {
    configuration: projectDescriptionBuilderConfiguration,
    isEnabled,
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled,
  },
  {
    configuration: bulkIdeaImportConfiguration,
    isEnabled,
  },
  {
    configuration: adminProjectTemplatesConfiguration,
    isEnabled,
  },
  {
    configuration: similarIdeaConfiguration,
    isEnabled,
  },
  {
    configuration: customMapsConfiguration,
    isEnabled,
  },
  {
    configuration: idAuth0Configuration,
    isEnabled,
  },
  {
    configuration: idBosaFasConfiguration,
    isEnabled,
  },
  {
    configuration: idCowConfiguration,
    isEnabled,
  },
  {
    configuration: idBogusConfiguration,
    isEnabled,
  },
  {
    configuration: idIdCardLookupConfiguration,
    isEnabled,
  },
  {
    configuration: IdFranceConnectConfiguration,
    isEnabled,
  },
  {
    configuration: IdGentRrnConfiguration,
    isEnabled,
  },
  {
    configuration: IdOostendeRrnConfiguration,
    isEnabled,
  },
  {
    configuration: IdClaveUnicaConfiguration,
    isEnabled,
  },
  {
    configuration: machineTranslationsConfiguration,
    isEnabled,
  },
  {
    configuration: widgetsConfiguration,
    isEnabled,
  },
  {
    configuration: eventsWidgetConfiguration,
    isEnabled,
  },
  {
    configuration: insightsConfiguration,
    isEnabled,
  },
  {
    configuration: analyticsConfiguration,
    isEnabled,
  },
  {
    configuration: idViennaSamlConfiguration,
    isEnabled,
  },
  {
    configuration: representativenessConfiguration,
    isEnabled,
  },
  {
    configuration: impactTrackingConfiguration,
    isEnabled,
  },
]);
