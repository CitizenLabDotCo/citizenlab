import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/reports`;

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

export interface Reports {
  data: Report[];
}

export function reportsStream() {
  return streams.get<Reports>({ apiEndpoint });
}

export async function createReport(name: string) {
  return streams.add(apiEndpoint, {
    report: { name },
  });
}

export async function deleteReport(id: string) {
  return streams.delete(`${apiEndpoint}/${id}`, id);
}
