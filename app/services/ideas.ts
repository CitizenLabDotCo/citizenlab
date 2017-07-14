import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

function getEndpoint() {
  return `${API_PATH}/ideas`;
}

export function observeIdeas(
  headerData = null,
  httpMethod = null,
  queryParameters = null,
  localProperties = null,
  onEachEmit = null,
) {
  const apiEndpoint = getEndpoint();
  return streams.create(apiEndpoint, headerData, httpMethod, queryParameters, localProperties, onEachEmit);
}
