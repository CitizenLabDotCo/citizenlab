import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

interface ICustomPage {
  data: { id: string };
}

const customPagesEndpoint = `${API_PATH}/static_pages`;

export function createCustomPageStream(pageData: { title_multiloc: Multiloc }) {
  return streams.add<ICustomPage>(`${customPagesEndpoint}`, pageData);
}
