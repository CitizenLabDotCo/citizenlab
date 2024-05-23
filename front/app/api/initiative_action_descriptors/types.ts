import { Keys } from 'utils/cl-react-query/types';

import initiativeActionDescriptorsKeys from './keys';
import { ActionDescriptor, UserDisabledReason } from 'utils/actionDescriptors';

export type InitiativeActionDescriptorsKeys = Keys<
  typeof initiativeActionDescriptorsKeys
>;

export type IInitiativeAction =
  | 'posting_initiative'
  | 'commenting_initiative'
  | 'reacting_initiative';

export type InitiativeDisabledReason = UserDisabledReason;

// Confusingly, 'comment_reacting_initiative' is an action descriptor, but
// not an action, and it doesn't have its own granular permissions.
// In other words, you can't specifically say that you don't want
// people to be able to reaction on comments. This is instead derived from 'commenting_initiative'.
// Why is it an action descriptor then, and why don't we just use 'commenting_initiative'?
// Because of legacy reasons. Should be fixed in the future.
// For now, just know that 'comment_reacting_initiative' is just an action descriptor,
// but not an action (so e.g. it can't be used in the authentication_requirements API).
export type IInitiativeActionDescriptorName =
  | IInitiativeAction
  | 'comment_reacting_initiative';

export type IInitiativeActionDescriptors = {
  data: {
    type: 'action_descriptors';
    attributes: {
      [key in IInitiativeActionDescriptorName]: ActionDescriptor<InitiativeDisabledReason>;
    };
  };
};
