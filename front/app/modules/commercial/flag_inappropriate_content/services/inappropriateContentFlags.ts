import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';

// To keep in sync with spam report reason codes
// Flags can't have the reason_code 'other' however
type TReasonCode = 'inappropriate' | 'wrong_content';

export interface IInappropriateContentFlagData {
  attributes: {
    // We want to keep the flag alive to potentially re-add it.
    // Therefore, to mark a "removed" flag in the front-end,
    // we check if the reason_code is set to null,
    // which is what happens when removeInappropriateContentFlag below is called
    // Note: if an item is flagged only by NLP and not by a user,
    // the reason_code will be 'inappropriate'
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

export function getFlagType(flag: IInappropriateContentFlagData) {
  // A flag could be both user and NLP flagged at the same time
  // Reporting NLP flagging has precedence.

  // If the reason_code is null, the flag has been removed
  if (flag.attributes.reason_code !== null) {
    // If flag has toxicity_label, we know for sure it's NLP flagged
    if (flag.attributes.toxicity_label) {
      return 'nlp_flagged';
    } else {
      // If toxicity_label is null, yet we have a flag with a reason_code that is not null,
      // we know it's user reported
      return 'user_flagged';
    }
  }

  return null;
}

const apiEndpoint = `${API_PATH}/inappropriate_content_flag`;

export function removeInappropriateContentFlag(flagId: string) {
  return streams.delete(`${apiEndpoint}/${flagId}#mark_as_deleted`, flagId);
}

export function inappropriateContentFlagByIdStream(flagId: string) {
  return streams.get<IInappropriateContentFlag>({
    apiEndpoint: `${apiEndpoint}/${flagId}`,
  });
}
