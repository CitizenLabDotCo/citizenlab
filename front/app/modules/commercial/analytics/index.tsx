import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectAnalyticsGraphs from './admin/components/ProjectAnalyticsGraphs';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboards.summary': ProjectAnalyticsGraphs,
  },
};

export default configuration;
