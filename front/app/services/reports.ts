import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

const apiEndpoint = `${API_PATH}/reports`;

// Reports
export interface Report {
  id: string;
  type: 'report';
  attributes: {
    name: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    layout: {
      data: {
        id: string;
        type: 'content-builder-layout';
      };
    };
    owner: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface ReportsResponse {
  data: Report[];
}

export interface ReportResponse {
  data: Report;
}

export function reportsStream() {
  return streams.get<ReportsResponse>({ apiEndpoint });
}

export function reportByIdStream(id: string) {
  return streams.get<ReportResponse>({
    apiEndpoint: `${apiEndpoint}/${id}`,
  });
}

export async function createReport(name: string) {
  return streams.add<ReportResponse>(apiEndpoint, {
    report: { name },
  });
}

export async function deleteReport(id: string) {
  return streams.delete(`${apiEndpoint}/${id}`, id);
}

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
