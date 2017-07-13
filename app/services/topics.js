import { API_PATH } from 'containers/App/constants';
import Streams from 'utils/streams';

function getEndpoint() {
  return `${API_PATH}/topics`;
}

export function observeTopics() {
  const apiEndpoint = getEndpoint();
  return Streams.create(apiEndpoint);
}
