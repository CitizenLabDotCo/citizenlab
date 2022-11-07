import { WrappedComponentProps } from 'react-intl';
import messages from '../../components/ProposalsCard/messages';
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';

export interface InvitationsLabels {
  cardTitle: string;
  fileName: string;
  total: string;
  successful: string;
  successfulToolTip: string;
  period: string;
}

export const getInvitationsLabels = (
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
  resolution
): InvitationsLabels => {
  return {
    cardTitle: formatMessage(messages.proposals),
    fileName: formatMessage(messages.proposals).toLowerCase().replace(' ', '_'),
    total: formatMessage(messages.totalProposals),
    successful: formatMessage(messages.successfulProposals),
    successfulToolTip: formatMessage(messages.successfulProposalsToolTip),
    period: getTimePeriodTranslationByResolution(formatMessage, resolution),
  };
};
