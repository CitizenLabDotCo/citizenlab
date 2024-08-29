import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Statistic from 'components/admin/Graphs/Statistic';
import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { getTimePeriodTranslationByResolution } from '../_utils/resolution';

import messages from './messages';
import { Stats } from './useVisitors/typings';

interface Props {
  stats: Stats | NilOrError;
  resolution: IResolution;
}

const EMPTY_STAT = { value: '-', lastPeriod: '-' };
const EMPTY_DATA: Stats = {
  visitors: EMPTY_STAT,
  visits: EMPTY_STAT,
  visitDuration: EMPTY_STAT,
  pageViews: EMPTY_STAT,
};

const VisitorStats = ({ stats, resolution }: Props) => {
  const { formatMessage } = useIntl();
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  const bottomLabel = getTimePeriodTranslationByResolution(
    formatMessage,
    resolution
  );

  return (
    <>
      <Box>
        <Statistic
          name={formatMessage(messages.visitors)}
          value={shownStats.visitors.value}
          bottomLabel={bottomLabel}
          bottomLabelValue={shownStats.visitors.lastPeriod}
          tooltipContent={formatMessage(messages.visitorsStatTooltipMessage)}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.visitDuration)}
            value={shownStats.visitDuration.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStats.visitDuration.lastPeriod}
          />
        </Box>
      </Box>
      <Box ml="28px">
        <Statistic
          name={formatMessage(messages.visits)}
          value={shownStats.visits.value}
          bottomLabel={bottomLabel}
          bottomLabelValue={shownStats.visits.lastPeriod}
          tooltipContent={formatMessage(messages.visitsStatTooltipMessage)}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.pageViews)}
            value={shownStats.pageViews.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStats.pageViews.lastPeriod}
          />
        </Box>
      </Box>
    </>
  );
};

export default VisitorStats;
