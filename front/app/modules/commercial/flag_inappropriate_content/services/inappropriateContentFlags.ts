import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IInappropriateContentFlagData {
  flaggable_type: string;
  flaggable_id: string;
  deleted_at: string;
  toxicity_label: string | null;
}

export interface IInappropriateContentFlag {
  data: IInappropriateContentFlagData;
}

export function getFlagType(flag: IInappropriateContentFlagData) {
  // A flag could be both user and NLP flagged
  // If flag has toxicity_label, we know it's NLP flagged
  // If toxicity_label is null, yet we have a flag, we know it's user reported
  if (flag.toxicity_label) {
    return 'nlp_flagged';
  } else {
    return 'user_flagged';
  }
}

const apiEndpoint = `${API_PATH}/inappropriate_content_flag`;

export function inappropriateContentFlagByIdStream(flagId: string) {
  return streams.get<IInappropriateContentFlag>({
    apiEndpoint: `${apiEndpoint}/${flagId}`,
  });
}

export function removeInappropriateContentFlag(flagId: string) {
  return streams.delete(`${apiEndpoint}/${flagId}#mark_as_deleted`, flagId);
}
