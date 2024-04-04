import { loadModules } from 'utils/moduleUtils';

import adminProjectTemplatesConfiguration, {
  projectTemplateRouteTypes,
} from './commercial/admin_project_templates';
import analyticsConfiguration, {
  analyticsRouteTypes,
} from './commercial/analytics';
import bulkIdeaImportConfiguration, {
  bulkIdeaImportRouteTypes,
} from './commercial/bulk_idea_import';
import customIdeaStatusesConfiguration, {
  customIdeaStatusesRouteTypes,
} from './commercial/custom_idea_statuses';
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
import intercomConfiguration from './commercial/intercom';
import machineTranslationsConfiguration from './commercial/machine_translations';
import matomoConfiguration from './commercial/matomo';
import moderationConfiguration, {
  moderationRouteTypes,
} from './commercial/moderation';
import posthogConfiguration from './commercial/posthog_integration';
import projectDescriptionBuilderConfiguration, {
  descriptionBuilderRouteTypes,
} from './commercial/project_description_builder';
import representativenessConfiguration, {
  representativenessRouteTypes,
} from './commercial/representativeness';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import smartGroupsConfiguration from './commercial/smart_groups';
import widgetsConfiguration, { widgetsRouteTypes } from './commercial/widgets';

export type moduleRouteTypes =
  | projectTemplateRouteTypes
  | analyticsRouteTypes
  | bulkIdeaImportRouteTypes
  | customIdeaStatusesRouteTypes
  | moderationRouteTypes
  | descriptionBuilderRouteTypes
  | representativenessRouteTypes
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
