import { WrappedComponentProps } from 'react-intl';
import messages from '../../components/ProposalsCard/messages';
import { IResolution } from '../../../../../../components/admin/ResolutionControl';
import moment from 'moment';

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
  if (resolution === 'week') period = messages.last7Days;
  if (resolution === 'day') period = messages.yesterday;

  return {
    cardTitle: formatMessage(messages.proposals),
    total: formatMessage(messages.totalProposals),
    successful: formatMessage(messages.successfulProposals),
    successfulToolTip: formatMessage(messages.successfulProposalsToolTip),
    period: formatMessage(period),
  };
};

export const getLastPeriodMoment = (resolution: IResolution) => {
  let days = 30;
  if (resolution === 'week') days = 7;
  if (resolution === 'day') days = 1;
  return moment().subtract({ days });
};
