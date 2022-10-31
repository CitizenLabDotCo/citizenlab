import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export const getEndpoint = (userCustomFieldId: string) =>
  `${API_PATH}/users/custom_fields/${userCustomFieldId}/rscore`;

export interface RScore {
  data: RScoreData;
}

export interface RScoreData {
  id: string;
  type: 'rscore';
  attributes: {
    score: number;
    counts: {
      [key: string]: number;
      _blank: number;
    };
  };
  relationships: {
    reference_distribution: {
      data: {
        id: string;
        type: 'reference_distribution';
      };
    };
  };
}

export function rScoreStream(userCustomFieldId: string, projectId?: string) {
  return streams.get<RScore>({
    apiEndpoint: getEndpoint(userCustomFieldId),
    queryParameters: {
      project: projectId,
    },
  });
}
