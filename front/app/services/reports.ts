import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/reports`;

export async function createReport(name: string) {
  return streams.add(apiEndpoint, {
    report: { name },
  });
}
