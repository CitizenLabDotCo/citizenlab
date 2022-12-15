import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './smart_groups';
import ideaCustomFieldsConfiguration from './idea_custom_fields';
import granularPermissionsConfiguration from './granular_permissions';
import ideaAssignmentConfiguration from './idea_assignment';
import moderationConfiguration from './moderation';
import flagInappropriateContentConfiguration from './flag_inappropriate_content';
import adminProjectTemplatesConfiguration from './admin_project_templates';
import machineTranslationsConfiguration from './machine_translations';
import similarIdeaConfiguration from './similar_ideas';
import customizableHomepageBannerConfiguration from './customizable_homepage_banner';

import customMapsConfiguration from './custom_maps';
import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';
import matomoConfiguration from './matomo';
import contentBuilderConfiguration from './content_builder';
import customIdeaStatusesConfiguration from './custom_idea_statuses';
import bulkIdeaImportConfiguration from './bulk_idea_import';
import customTopicsConfiguration from './custom_topics';
import impactTrackingConfiguration from './impact_tracking';

import idAuth0Configuration from './id_auth0';
import idBosaFasConfiguration from './id_bosa_fas';
import idCowConfiguration from './id_cow';
import idBogusConfiguration from './id_bogus';
import idIdCardLookupConfiguration from './id_id_card_lookup';
import IdFranceConnectConfiguration from './id_franceconnect';
import IdGentRrnConfiguration from './id_gent_rrn';
import IdOostendeRrnConfiguration from './id_oostende_rrn';
import IdClaveUnicaConfiguration from './id_clave_unica';

import widgetsConfiguration from './widgets';
import eventsWidgetConfiguration from './events_widget';

import insightsConfiguration from './insights';
import analyticsConfiguration from './analytics';

import idViennaSamlConfiguration from './id_vienna_saml';
import representativenessConfiguration from './representativeness';

// eslint-disable-next-line no-var
declare var CL_CONFIG: any;

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/smart_groups'],
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
    configuration: flagInappropriateContentConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/flag_inappropriate_content'],
  },
  {
    configuration: ideaAssignmentConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/idea_assignment'],
  },
  {
    configuration: contentBuilderConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/content_builder'],
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_idea_statuses'],
  },
  {
    configuration: bulkIdeaImportConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/bulk_import_ideas'],
  },
  {
    configuration: customTopicsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/custom_topics'],
  },
  {
    configuration: customizableHomepageBannerConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/customizable_homepage_banner'],
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
    configuration: IdOostendeRrnConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_oostende_rrn'],
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
    configuration: widgetsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/widgets'],
  },
  {
    configuration: eventsWidgetConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/events_widget'],
  },
  {
    configuration: insightsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/insights'],
  },
  {
    configuration: analyticsConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/analytics'],
  },
  {
    configuration: idViennaSamlConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/id_vienna_saml'],
  },
  {
    configuration: representativenessConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/representativeness'],
  },
  {
    configuration: impactTrackingConfiguration,
    isEnabled: CL_CONFIG['modules']['commercial/impact_tracking'],
  },
]);
