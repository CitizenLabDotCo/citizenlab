// utils
import { ModuleConfiguration } from 'utils/moduleUtils';
import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

const trackSessionStarted = () => {
  request(`${API_PATH}/sessions`, {}, { method: 'POST' }, null);
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    trackSessionStarted();
  },
};

export default configuration;
