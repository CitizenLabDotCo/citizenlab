import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './commercial/smart_groups';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import granularPermissionsConfiguration from './commercial/granular_permissions';
import moderationConfiguration from './commercial/moderation';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';

import contentBuilderConfiguration from './commercial/content_builder';
import customIdeaStatusesConfiguration from './commercial/custom_idea_statuses';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

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
    configuration: contentBuilderConfiguration,
    isEnabled,
  },
  {
    configuration: customIdeaStatusesConfiguration,
    isEnabled,
  },
  {
    configuration: adminProjectTemplatesConfiguration,
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
]);
