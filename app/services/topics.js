import { API_PATH } from 'containers/App/constants';
import Streams from 'utils/streams';

function getEndpoint() {
  return `${API_PATH}/topics`;
}

export function observeTopics(
  headerData = null,
  httpMethod = null,
  queryParameters = null,
  localProperties = false,
  onEachEmit = null,
) {
  const apiEndpoint = getEndpoint();
  return Streams.create(apiEndpoint, headerData, httpMethod, queryParameters, localProperties, onEachEmit);
}
