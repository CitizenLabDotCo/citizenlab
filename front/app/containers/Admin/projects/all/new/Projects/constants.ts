import { Visibility } from 'api/projects/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const VISIBILITY_LABELS: Record<Visibility, MessageDescriptor> = {
  admins: messages.admins,
  groups: messages.groups,
  public: messages.public,
};
