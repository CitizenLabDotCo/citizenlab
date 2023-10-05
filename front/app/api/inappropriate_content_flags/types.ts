import { IRelationship } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import inappropriateContentFlagsKeys from './keys';

export type InappropriateContentFlagsKeys = Keys<
  typeof inappropriateContentFlagsKeys
>;

type TReasonCode = 'inappropriate' | 'wrong_content';

export interface IInappropriateContentFlagData {
  id: string;
  type: 'inappropriate_content_flag';
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
