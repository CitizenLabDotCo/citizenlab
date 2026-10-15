import { Visibility } from 'api/projects/types';
import { DisplayStatus } from 'api/projects_mini_admin/types';

import { MessageDescriptor } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';

import messages from './messages';

// The same words in the cells, on the cards and in the filters.
export const STATUS_MESSAGES: Record<DisplayStatus, MessageDescriptor> = {
  published: messages.live,
  pending: messages.pendingApproval,
  draft: sharedMessages.draft,
  archived: sharedMessages.archived,
};

export const ACCESS_MESSAGES: Record<Visibility, MessageDescriptor> = {
  public: messages.anyone,
  groups: messages.selectedGroups,
  admins: messages.adminsAndManagers,
};
