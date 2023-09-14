import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import moderationsKeys from 'modules/commercial/moderation/api/moderations/keys';
import moderationsCountKeys from 'modules/commercial/moderation/api/moderation_count/keys';

// To keep in sync with spam report reason codes
// Flags can't have the reason_code 'other' however
type TReasonCode = 'inappropriate' | 'wrong_content';

export interface IInappropriateContentFlagData {
  id: string;
  type: string;
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

const apiEndpoint = `${API_PATH}/inappropriate_content_flags`;

export async function removeInappropriateContentFlag(flagId: string) {
  const response = streams.update(
    `${apiEndpoint}/${flagId}/mark_as_deleted`,
    flagId,
    {}
  );

  queryClient.invalidateQueries({
    queryKey: moderationsKeys.lists(),
  });
  queryClient.invalidateQueries({
    queryKey: moderationsCountKeys.items(),
  });

  return response;
}

export function inappropriateContentFlagByIdStream(flagId: string) {
  return streams.get<IInappropriateContentFlag>({
    apiEndpoint: `${apiEndpoint}/${flagId}`,
  });
}
