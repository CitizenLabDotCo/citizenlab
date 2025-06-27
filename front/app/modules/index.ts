import { loadModules } from 'utils/moduleUtils';

import adminProjectTemplatesConfiguration, {
  projectTemplateRouteTypes,
} from './commercial/admin_project_templates';
import bulkIdeaImportConfiguration, {
  bulkIdeaImportRouteTypes,
} from './commercial/bulk_idea_import';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import idAuth0Configuration from './commercial/id_auth0';
import idBogusConfiguration from './commercial/id_bogus';
import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idClaveUnicaConfiguration from './commercial/id_clave_unica';
import idCowConfiguration from './commercial/id_cow';
import idCriiptoConfiguration from './commercial/id_criipto';
import idFakeSSOConfiguration from './commercial/id_fake_sso';
import idFranceConnectConfiguration from './commercial/id_franceconnect';
import idGentRrnConfiguration from './commercial/id_gent_rrn';
import idIdAustriaConfiguration from './commercial/id_id_austria';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import idKeycloakConfiguration from './commercial/id_keycloak';
import idNemLogInConfiguration from './commercial/id_nemlog_in';
import idOostendeRrnConfiguration from './commercial/id_oostende_rrn';
import idTwodayConfiguration from './commercial/id_twoday';
import idViennaSamlConfiguration from './commercial/id_vienna_saml';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import impactTrackingConfiguration from './commercial/impact_tracking';
import intercomConfiguration from './commercial/intercom';
import machineTranslationsConfiguration from './commercial/machine_translations';
import matomoConfiguration from './commercial/matomo';
import posthogConfiguration from './commercial/posthog_integration';
import posthogUserTrackingConfiguration from './commercial/posthog_user_tracking';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import smartGroupsConfiguration from './commercial/smart_groups';
import widgetsConfiguration, { widgetsRouteTypes } from './commercial/widgets';

export type moduleRouteTypes =
  | projectTemplateRouteTypes
  | bulkIdeaImportRouteTypes
  | widgetsRouteTypes;

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
    configuration: posthogUserTrackingConfiguration,
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
    configuration: flagInappropriateContentConfiguration,
  },
  {
    configuration: ideaAssignmentConfiguration,
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
    configuration: idFakeSSOConfiguration,
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
    configuration: idIdAustriaConfiguration,
  },
  {
    configuration: idCriiptoConfiguration,
  },
  {
    configuration: idKeycloakConfiguration,
  },
  {
    configuration: idTwodayConfiguration,
  },
  {
    configuration: idBogusConfiguration,
  },
  {
    configuration: idIdCardLookupConfiguration,
  },
  {
    configuration: idFranceConnectConfiguration,
  },
  {
    configuration: idGentRrnConfiguration,
  },
  {
    configuration: idOostendeRrnConfiguration,
  },
  {
    configuration: idClaveUnicaConfiguration,
  },
  {
    configuration: machineTranslationsConfiguration,
  },
  {
    configuration: widgetsConfiguration,
  },
  {
    configuration: idViennaSamlConfiguration,
  },
  {
    configuration: impactTrackingConfiguration,
  },
]);
