import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

const apiEndpoint = `${API_PATH}/reports`;

// Report layouts
export interface ReportLayout {
  id: string;
  type: 'content_builder_layout';
  attributes: {
    enabled: boolean;
    code: 'report';
    created_at: string;
    updated_at: string;
    craftjs_jsonmultiloc: JsonMultiloc;
  };
}

export interface ReportLayoutResponse {
  data: ReportLayout;
}

export function reportLayoutByIdStream(id: string) {
  return streams.get<ReportLayoutResponse>({
    apiEndpoint: `${apiEndpoint}/${id}/layout`,
    handleErrorLogging: (error) => {
      // A 404 error is expected when the content builder layout is not found so we don't want to log it
      if (error.statusCode !== 404) {
        reportError(error);
      }
    },
  });
}

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
