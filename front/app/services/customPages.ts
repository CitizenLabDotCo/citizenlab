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

export function customPageByIdStream(
  customPageId: string,
) {
  return streams.get({
    apiEndpoint: `${customPagesEndpoint}/${customPageId}`
  });
}

export async function updateCustomPage(
  customPageId: string,
  // still to update, won't work for header_bg, which has different types when
  // updating vs. getting the data.
  updatedPageSettings
) {
  const customPageSettings = await streams.update(
    `${customPagesEndpoint}/${customPageId}`,
    customPageId,
    { static_page: updatedPageSettings }
  );
  // is this needed?
  return customPageSettings;
}