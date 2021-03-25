import { ModuleConfiguration } from 'utils/moduleUtils';
import ActionBarTranslateButton from './citizen/components/ActionBarTranslateButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.PostShowComponents.ActionBar.right': ActionBarTranslateButton,
  },
};

export default configuration;
