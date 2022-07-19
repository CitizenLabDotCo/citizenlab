import { ModuleConfiguration } from 'utils/moduleUtils';
import AnalyticsGraphs from './admin/components/AnalyticsGraphs';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.dashboards.summary': AnalyticsGraphs,
  },
};

export default configuration;
