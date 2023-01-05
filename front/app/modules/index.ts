import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './commercial/smart_groups';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import moderationConfiguration from './commercial/moderation';
import flagInappropriateContentConfiguration from './commercial/flag_inappropriate_content';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import machineTranslationsConfiguration from './commercial/machine_translations';
import similarIdeaConfiguration from './commercial/similar_ideas';
import customizableHomepageBannerConfiguration from './commercial/customizable_homepage_banner';

import customMapsConfiguration from './commercial/custom_maps';
import googleTagManagerConfiguration from './commercial/google_tag_manager';
import googleAnalyticsConfiguration from './commercial/google_analytics';
import intercomConfiguration from './commercial/intercom';
import satismeterConfiguration from './commercial/satismeter';
import segmentConfiguration from './commercial/segment';
import matomoConfiguration from './commercial/matomo';
import contentBuilderConfiguration from './commercial/content_builder';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';
import bulkIdeaImportConfiguration from './commercial/bulk_idea_import';
import impactTrackingConfiguration from './commercial/impact_tracking';

import idBosaFasConfiguration from './commercial/id_bosa_fas';
import idCowConfiguration from './commercial/id_cow';
import idIdCardLookupConfiguration from './commercial/id_id_card_lookup';
import IdFranceConnectConfiguration from './commercial/id_franceconnect';
import IdGentRrnConfiguration from './commercial/id_gent_rrn';
import IdOostendeRrnConfiguration from './commercial/id_oostende_rrn';
import IdClaveUnicaConfiguration from './commercial/id_clave_unica';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

import insightsConfiguration from './commercial/insights';
import analyticsConfiguration from './commercial/analytics';

import idViennaSamlConfiguration from './commercial/id_vienna_saml';
import representativenessConfiguration from './commercial/representativeness';

// eslint-disable-next-line no-var
declare var CITIZENLAB_EE: boolean;

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: ideaCustomFieldsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: googleTagManagerConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: matomoConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: googleAnalyticsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: intercomConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: satismeterConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: segmentConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: granularPermissionsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: moderationConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: flagInappropriateContentConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: ideaAssignmentConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: contentBuilderConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: bulkIdeaImportConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: customizableHomepageBannerConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: adminProjectTemplatesConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: similarIdeaConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: customMapsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: idBosaFasConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: idCowConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: idIdCardLookupConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: IdFranceConnectConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: IdGentRrnConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: IdOostendeRrnConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: IdClaveUnicaConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: machineTranslationsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: widgetsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: eventsWidgetConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: insightsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: analyticsConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: idViennaSamlConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: representativenessConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
  {
    configuration: impactTrackingConfiguration,
    isEnabled: CITIZENLAB_EE,
  },
]);
