import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

const apiEndpoint = `${API_PATH}/reports`;

// Report layouts

export async function updateReportLayout(
  id: string,
  craftMultiloc: JsonMultiloc
) {
  const response = await streams.update(`${apiEndpoint}/${id}`, id, {
    report: {
      layout: {
        craftjs_jsonmultiloc: craftMultiloc,
      },
    },
  });

  await streams.fetchAllWith({ apiEndpoint: [`${apiEndpoint}/${id}/layout`] });

  return response;
}
