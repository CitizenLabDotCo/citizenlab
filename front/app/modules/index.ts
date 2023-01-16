import { loadModules } from 'utils/moduleUtils';

import smartGroupsConfiguration from './commercial/smart_groups';
import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import moderationConfiguration from './commercial/moderation';
import adminProjectTemplatesConfiguration from './commercial/admin_project_templates';

import contentBuilderConfiguration from './commercial/content_builder';

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
    configuration: moderationConfiguration,
    isEnabled,
  },
  {
    configuration: contentBuilderConfiguration,
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
