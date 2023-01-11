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

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

import insightsConfiguration from './commercial/insights';
import analyticsConfiguration from './commercial/analytics';

import representativenessConfiguration from './commercial/representativeness';

// eslint-disable-next-line no-var
declare var CITIZENLAB_EE: string;

const isEnabled = CITIZENLAB_EE === 'true';

export default loadModules([
  {
    configuration: smartGroupsConfiguration,
    isEnabled,
  },
  {
    configuration: ideaCustomFieldsConfiguration,
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
    configuration: contentBuilderConfiguration,
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
    configuration: representativenessConfiguration,
    isEnabled,
  },
  {
    configuration: impactTrackingConfiguration,
    isEnabled,
  },
]);
