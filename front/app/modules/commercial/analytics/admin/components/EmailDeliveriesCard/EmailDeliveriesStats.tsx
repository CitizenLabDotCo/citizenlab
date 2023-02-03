import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Stats } from './useEmailDeliveries/typings';

interface Props {
  stats: NilOrError | Stats;
}

const EMPTY_DATA: Stats = {
  total: '-',
  custom: '-',
  customCampaigns: '-',
  automated: '-',
  automatedCampaigns: '-',
};

const EmailDeliveriesStats = ({ stats }: Props) => {
  const { formatMessage } = useIntl();
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  return (
    <>
      <Box>
        <Statistic
          name={formatMessage(messages.totalEmailsSent)}
          value={shownStats.total ?? '-'}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.automatedEmails)}
            value={shownStats.automated ?? '-'}
            bottomLabel={formatMessage(messages.bottomStatLabel, {
              quantity: shownStats.automatedCampaigns ?? '-',
            })}
          />
        </Box>
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.customEmails)}
            value={shownStats.custom ?? '-'}
            bottomLabel={formatMessage(messages.bottomStatLabel, {
              quantity: shownStats.customCampaigns ?? '-',
            })}
          />
        </Box>
      </Box>
    </>
  );
};

export default EmailDeliveriesStats;
