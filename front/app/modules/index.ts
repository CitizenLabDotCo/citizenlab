import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './commercial/smart_groups';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import ideaAssignmentConfiguration from './commercial/idea_assignment';
import moderationConfiguration from './commercial/moderation';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';
import machineTranslationsConfiguration from './commercial/machine_translations';
import customizableHomepageBannerConfiguration from './commercial/customizable_homepage_banner';
import similarIdeaConfiguration from './commercial/similar_ideas';

import customMapsConfiguration from './commercial/custom_maps';
import contentBuilderConfiguration from './commercial/content_builder';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';
import bulkIdeaImportConfiguration from './commercial/bulk_idea_import';
import impactTrackingConfiguration from './commercial/impact_tracking';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

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
    configuration: customMapsConfiguration,
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
