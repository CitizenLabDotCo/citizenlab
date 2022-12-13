import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

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

export function reportByIdStream(id: string) {
  return streams.get<ReportResponse>({
    apiEndpoint: `${reportsApiEndpoint}/${id}`,
  });
}

export async function createReport(name: string) {
  return streams.add(reportsApiEndpoint, {
    report: { name },
  });
}

export async function deleteReport(id: string) {
  return streams.delete(`${reportsApiEndpoint}/${id}`, id);
}

// Report layouts
interface ReportLayout {
  // TODO
}

interface ReportLayoutReponse {
  data: ReportLayout;
}

export function reportLayoutStream(id: string) {
  return streams.get<ReportLayoutReponse>({
    apiEndpoint: `${API_PATH}/reports/${id}/layout`, // TODO
    handleErrorLogging: (error) => {
      // A 404 error is expected when the content builder layout is not found so we don't want to log it
      if (error.statusCode !== 404) {
        reportError(error);
      }
    },
  });
}
