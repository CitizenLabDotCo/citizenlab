import { WrappedComponentProps } from 'react-intl';
import messages from '../../components/InvitationsCard/messages';
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';

export interface InvitationsLabels {
  cardTitle: string;
  fileName: string;
  total: string;
  pending: string;
  accepted: string;
  period: string;
}

export const getInvitationsLabels = (
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
  resolution
): InvitationsLabels => {
  return {
    cardTitle: formatMessage(messages.invitations),
    fileName: formatMessage(messages.invitations)
      .toLowerCase()
      .replace(' ', '_'),
    total: formatMessage(messages.totalInvites),
    pending: formatMessage(messages.pending),
    accepted: formatMessage(messages.accepted),
    period: getTimePeriodTranslationByResolution(formatMessage, resolution),
  };
};
