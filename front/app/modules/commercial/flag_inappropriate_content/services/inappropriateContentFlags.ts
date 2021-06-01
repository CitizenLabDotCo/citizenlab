import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';

type TReasonCode = 'inappropriate' | 'wrong' | 'other';

export interface IInappropriateContentFlagData {
  attributes: {
    // We want to keep the flag alive to potentially readd it.
    // Therefore, to mark a "removed" flag in the front-end,
    // we check if the reason_code is set to null,
    // which is what happens when removeInappropriateContentFlag below is called
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

export function removeInappropriateContentFlag(flagId: string) {
  return streams.delete(`${apiEndpoint}/${flagId}#mark_as_deleted`, flagId);
}
