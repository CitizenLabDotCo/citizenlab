import { loadModules } from 'utils/moduleUtils';

import ideaCustomFieldsConfiguration from './commercial/idea_custom_fields';

// eslint-disable-next-line no-var
declare var CITIZENLAB_EE: string;

const isEnabled = CITIZENLAB_EE === 'true';

export default loadModules([
  {
    configuration: ideaCustomFieldsConfiguration,
    isEnabled,
  },
]);
