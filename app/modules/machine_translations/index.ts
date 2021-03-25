import { ModuleConfiguration } from 'utils/moduleUtils';
import ActionBarTranslateButton from './citizen/components/ActionBarTranslateButton';
import CommentTranslateButton from './citizen/components/CommentTranslateButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.PostShowComponents.ActionBar.right': ActionBarTranslateButton,
    'app.components.PostShowComponents.CommentFooter.left': CommentTranslateButton,
  },
};

export default configuration;
