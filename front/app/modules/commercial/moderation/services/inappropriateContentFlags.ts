import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export interface IInappropriateContentFlagData {
  attributes: {
    flaggable_type: '';
    flaggable_id: string;
    deleted_at: string;
    toxicity_label: number | null;
  };
}

export interface IInappropriateContentFlag {
  data: IInappropriateContentFlagData;
}

export function inappropriateContentFlagByIdStream(ideaId: string) {
  return streams.get<IInappropriateContentFlag>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}`,
  });
}
