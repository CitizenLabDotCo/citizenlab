import { Keys } from 'utils/cl-react-query/types';
import initiativeActionDescriptorsKeys from './keys';

export type InitiativeActionDescriptorsKeys = Keys<
  typeof initiativeActionDescriptorsKeys
>;

export type IInitiativeAction =
  | 'posting_initiative'
  | 'commenting_initiative'
  | 'voting_initiative'
  | 'comment_voting_initiative';

export type InitiativeDisabledReason =
  | 'not_permitted'
  | 'not_verified'
  | 'not_signed_in'
  | 'not_active';

export type IInitiativeActionDescriptors = {
  data: {
    type: 'action_descriptors';
    attributes: {
      [key in IInitiativeAction]: {
        enabled: boolean;
        disabled_reason: InitiativeDisabledReason | null;
      };
    };
  };
};
