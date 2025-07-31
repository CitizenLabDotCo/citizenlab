import { PublicationStatus } from 'api/projects/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const PUBLICATION_STATUS_LABELS: Record<
  PublicationStatus | 'pending_approval',
  MessageDescriptor
> = {
  draft: messages.draft,
  pending_approval: messages.pendingApproval,
  published: messages.published,
  archived: messages.archived,
};
