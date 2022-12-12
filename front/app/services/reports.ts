import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/reports`;

export interface Report {
  id: string;
  type: 'report';
  attributes: {
    name: string;
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
  return streams.get<ReportResponse>({ apiEndpoint: `${apiEndpoint}/${id}` });
}

export async function createReport(name: string) {
  return streams.add(apiEndpoint, {
    report: { name },
  });
}

export async function deleteReport(id: string) {
  return streams.delete(`${apiEndpoint}/${id}`, id);
}
