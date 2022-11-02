import { WrappedComponentProps } from 'react-intl';
import messages from '../../components/ProposalsCard/messages';

export interface Labels {
  cardTitle: string;
  total: string;
  successful: string;
  successfulToolTip: string;
  period: string;
}

export const getLabels = (
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
  resolution
): Labels => {
  let period = messages.last30Days;
  if (resolution === 'month') period = messages.last7Days;
  if (resolution === 'week') period = messages.yesterday;

  return {
    cardTitle: formatMessage(messages.proposals),
    total: formatMessage(messages.totalProposals),
    successful: formatMessage(messages.successfulProposals),
    successfulToolTip: formatMessage(messages.successfulProposalsToolTip),
    period: formatMessage(period),
  };
};
