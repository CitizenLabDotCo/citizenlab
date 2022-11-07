import { WrappedComponentProps } from 'react-intl';
import messages from '../../components/ProposalsCard/messages';
import { getTimePeriodTranslationByResolution } from '../../utils/resolution';

export interface ProposalsLabels {
  cardTitle: string;
  fileName: string;
  total: string;
  successful: string;
  successfulToolTip: string;
  period: string;
}

export const getProposalsLabels = (
  formatMessage: WrappedComponentProps['intl']['formatMessage'],
  resolution
): ProposalsLabels => {
  return {
    cardTitle: formatMessage(messages.proposals),
    fileName: formatMessage(messages.proposals).toLowerCase().replace(' ', '_'),
    total: formatMessage(messages.totalProposals),
    successful: formatMessage(messages.successfulProposals),
    successfulToolTip: formatMessage(messages.successfulProposalsToolTip),
    period: getTimePeriodTranslationByResolution(formatMessage, resolution),
  };
};
