import { loadModules } from 'utils/moduleUtils';

import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import analyticsConfiguration from './commercial/analytics';
import bulkIdeaImportConfiguration from './commercial/bulk_idea_import';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import idAuth0Configuration from './commercial/id_auth0';
import idBogusConfiguration from './commercial/id_bogus';
import idBosaFasConfiguration from './commercial/id_bosa_fas';
import IdClaveUnicaConfiguration from './commercial/id_clave_unica';
import idCowConfiguration from './commercial/id_cow';
import idCriiptoConfiguration from './commercial/id_criipto';
import IdFranceConnectConfiguration from './commercial/id_franceconnect';
import IdGentRrnConfiguration from './commercial/id_gent_rrn';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import idNemLogInConfiguration from './commercial/id_nemlog_in';
import IdOostendeRrnConfiguration from './commercial/id_oostende_rrn';
import idViennaSamlConfiguration from './commercial/id_vienna_saml';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import impactTrackingConfiguration from './commercial/impact_tracking';
import insightsConfiguration from './commercial/insights';
import intercomConfiguration from './commercial/intercom';
import machineTranslationsConfiguration from './commercial/machine_translations';
import matomoConfiguration from './commercial/matomo';
import moderationConfiguration from './commercial/moderation';
import posthogConfiguration from './commercial/posthog_integration';
import projectDescriptionBuilderConfiguration from './commercial/project_description_builder';
import representativenessConfiguration from './commercial/representativeness';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import smartGroupsConfiguration from './commercial/smart_groups';
import widgetsConfiguration from './commercial/widgets';

// Add all module routes here
export type ModuleRouteTypes = '/module';

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
