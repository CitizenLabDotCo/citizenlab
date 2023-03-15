import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/causes`;

interface CauseImageSizes {
  medium: string | null;
}

export interface ICauseData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    image: CauseImageSizes;
    volunteers_count: number;
    ordering: number;
  };
  relationships: {
    participation_context: {
      data: {
        type: 'project' | 'phase';
        id: string;
      };
    };
    user_volunteer?: {
      data: null | {
        id: string;
      };
    };
  };
}

export interface ICauseLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface ICauses {
  data: ICauseData[];
  links: ICauseLinks;
}

export interface ICause {
  data: ICauseData;
}

export async function updateCause(causeId: string, object) {
  const stream = streams.update<ICause>(`${apiEndpoint}/${causeId}`, causeId, {
    cause: object,
  });
  await streams.fetchAllWith({ dataId: [causeId] });
  return stream;
}

export function deleteCause(causeId: string) {
  return streams.delete(`${apiEndpoint}/${causeId}`, causeId);
}

export function reorderCause(causeId: string, ordering: number) {
  return streams.update<ICause>(`${apiEndpoint}/${causeId}/reorder`, causeId, {
    cause: { ordering },
  });
}
