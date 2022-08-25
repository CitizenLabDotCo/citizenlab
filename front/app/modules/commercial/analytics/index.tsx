import { ModuleConfiguration } from 'utils/moduleUtils';
import PostFeedback from './admin/containers/PostFeedback';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboard.summary.postStatus': PostFeedback,
  },
};

export default configuration;
