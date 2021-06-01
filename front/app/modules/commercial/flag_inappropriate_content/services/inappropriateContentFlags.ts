import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';

type TReasonCode = 'inappropriate' | 'wrong' | 'other';

interface IInappropriateContentFlagData {
  attributes: {
    reason_code: TReasonCode | null;
    deleted_at: string | null;
    toxicity_label: string | null;
  };
  relationships: {
    flaggable: {
      data: IRelationship;
    };
  };
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
