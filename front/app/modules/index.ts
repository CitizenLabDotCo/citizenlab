import { loadModules } from 'utils/moduleUtils';

import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';
import moderationConfiguration from './commercial/moderation';

import widgetsConfiguration from './commercial/widgets';
import eventsWidgetConfiguration from './commercial/events_widget';

// eslint-disable-next-line no-var
declare var CITIZENLAB_EE: string;

const isEnabled = CITIZENLAB_EE === 'true';

export default loadModules([
  {
    configuration: ideaCustomFieldsConfiguration,
    isEnabled,
  },
  {
    configuration: moderationConfiguration,
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
