import { API_PATH } from 'containers/App/constants';
import Streams from 'utils/streams';

function getEndpoint() {
  return `${API_PATH}/areas`;
}

export function observeAreas() {
  const apiEndpoint = getEndpoint();
  return Streams.create(apiEndpoint);
}
