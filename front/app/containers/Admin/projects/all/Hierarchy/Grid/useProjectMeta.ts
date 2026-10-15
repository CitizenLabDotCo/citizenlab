import {
  DisplayStatus,
  ProjectMiniAdminData,
} from 'api/projects_mini_admin/types';

import { PARTICIPATION_METHOD_LABELS } from 'containers/Admin/inspirationHub/constants';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import sharedMessages from '../../_shared/messages';
import messages from '../messages';

const STATUS_MESSAGES: Record<DisplayStatus, MessageDescriptor> = {
  published: messages.live,
  pending: messages.pendingApproval,
  draft: sharedMessages.draft,
  archived: sharedMessages.archived,
};

// "Live · Voting · open until 19 Oct": the status, then the phase the project
// is about right now.
const useProjectMeta = (project: ProjectMiniAdminData) => {
  const { formatMessage, formatDate } = useIntl();
  const { display_status, highlighted_phase } = project.attributes;

  const status = formatMessage(STATUS_MESSAGES[display_status]);

  if (!highlighted_phase) {
    return [status, formatMessage(messages.noPhasesYet)].join(' · ');
  }

  const { participation_method, start_at, end_at } = highlighted_phase;
  const shortDate = (date: string) =>
    formatDate(parseBackendDateString(date), {
      day: 'numeric',
      month: 'short',
    });

  const when =
    highlighted_phase.status === 'ended'
      ? formatMessage(messages.ended)
      : highlighted_phase.status === 'upcoming'
      ? formatMessage(messages.starts, { date: shortDate(start_at) })
      : end_at
      ? formatMessage(messages.openUntil, { date: shortDate(end_at) })
      : formatMessage(messages.open);

  return [
    status,
    formatMessage(PARTICIPATION_METHOD_LABELS[participation_method]),
    when,
  ].join(' · ');
};

export default useProjectMeta;
