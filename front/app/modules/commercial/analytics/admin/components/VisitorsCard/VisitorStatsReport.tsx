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
import { Stats } from '../../hooks/useVisitors/typings';

interface Props {
  stats: Stats | NilOrError;
}

const EMPTY_STAT = { value: '-', lastPeriod: '-' };
const EMPTY_DATA: Stats = {
  visitors: EMPTY_STAT,
  visits: EMPTY_STAT,
  visitDuration: EMPTY_STAT,
  pageViews: EMPTY_STAT,
};

const VisitorStatsReport = ({ stats }: Props) => {
  const { formatMessage } = useIntl();
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  return (
    <Box>
      <Statistic
        name={formatMessage(messages.visitors)}
        value={shownStats.visitors.value}
      />
      <Box mt="32px">
        <Statistic
          name={formatMessage(messages.visits)}
          value={shownStats.visits.value}
        />
      </Box>
    </Box>
  );
};

export default VisitorStatsReport;
