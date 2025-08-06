import { PublicationStatus } from 'api/projects/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const PUBLICATION_STATUS_LABELS: Record<
  PublicationStatus | 'pending',
  MessageDescriptor
> = {
  draft: messages.draft,
  pending: messages.pendingApproval,
  published: messages.published,
  archived: messages.archived,
};
