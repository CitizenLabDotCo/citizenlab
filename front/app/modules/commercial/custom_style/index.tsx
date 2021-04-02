import { ModuleConfiguration } from 'utils/moduleUtils';
import CustomStyleInputs from './admin/components/CustomStyleInputs';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.fields': CustomStyleInputs,
  },
};

export default configuration;
