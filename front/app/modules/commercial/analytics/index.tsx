import { ModuleConfiguration } from 'utils/moduleUtils';
import PostFeedback from './admin/components/PostFeedback';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboards.summary': PostFeedback,
  },
};

export default configuration;
