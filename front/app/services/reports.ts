import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

const reportsApiEndpoint = `${API_PATH}/reports`;

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
  return streams.get<ReportsResponse>({ apiEndpoint: reportsApiEndpoint });
}

export function reportByIdStream(reportId: string) {
  return streams.get<ReportResponse>({
    apiEndpoint: `${reportsApiEndpoint}/${reportId}`,
  });
}

export async function createReport(name: string) {
  return streams.add(reportsApiEndpoint, {
    report: { name },
  });
}

export async function deleteReport(reportId: string) {
  return streams.delete(`${reportsApiEndpoint}/${reportId}`, reportId);
}

// Report layouts
interface ReportLayout {
  // TODO
}

interface ReportLayoutReponse {
  data: ReportLayout;
}

export function reportLayoutStream(layoutId: string) {
  return streams.get<ReportLayoutReponse>({
    apiEndpoint: `${API_PATH}/???/${layoutId}`, // TODO
    handleErrorLogging: (error) => {
      // A 404 error is expected when the content builder layout is not found so we don't want to log it
      if (error.statusCode !== 404) {
        reportError(error);
      }
    },
  });
}

export function updateReportLayout(
  reportId: string,
  craftMultiloc: JsonMultiloc
) {
  return streams.update(`${reportsApiEndpoint}/${reportId}`, reportId, {
    report: {
      layout: {
        craftjs_jsonmultiloc: craftMultiloc,
      },
    },
  });
}
