import { ModuleConfiguration } from 'utils/moduleUtils';
import CustomStyleInputs from './admin/components/CustomStyleInputs';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.header_bg_section_field_end':
      CustomStyleInputs,
  },
};

export default configuration;
