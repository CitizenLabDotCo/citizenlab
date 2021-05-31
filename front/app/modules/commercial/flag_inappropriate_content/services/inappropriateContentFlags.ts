import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

interface IInappropriateContentFlagData {
  flaggable_type: string;
  flaggable_id: string;
  deleted_at: string;
  toxicity_label: string | null;
}

export interface IInappropriateContentFlag {
  data: IInappropriateContentFlagData;
}

const apiEndpoint = `${API_PATH}/inappropriate_content_flag`;

export function removeInappropriateContentFlag(flaggableId: string) {
  return streams.delete(
    `${apiEndpoint}/${flaggableId}#mark_as_deleted`,
    flaggableId
  );
}
