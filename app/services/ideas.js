import { API_PATH } from 'containers/App/constants';
import Streams from 'utils/streams';

function getEndpoint() {
  return `${API_PATH}/ideas`;
}

export function observeIdeas(queryParameters = null) {
  const apiEndpoint = getEndpoint();
  return Streams.create(apiEndpoint, null, null, queryParameters);
}
