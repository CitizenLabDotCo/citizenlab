import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import messages from './messages';
import { injectIntl, MessageDescriptor } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Stats } from '../../hooks/useVisitors/typings';

interface Props {
  stats: Stats | NilOrError;
  projectFilter: string | undefined;
  resolution: IResolution;
}

export const BOTTOM_LABEL_COPY: Record<IResolution, MessageDescriptor> = {
  month: messages.last30Days,
  week: messages.last7Days,
  day: messages.yesterday,
};

const EMPTY_STAT = { value: '-', lastPeriod: '-' };
const EMPTY_DATA: Stats = {
  visitors: EMPTY_STAT,
  visits: EMPTY_STAT,
  visitDuration: EMPTY_STAT,
  pageViews: EMPTY_STAT,
};

const VisitorStats = ({
  stats,
  projectFilter,
  resolution,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

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
            tooltipContent={
              projectFilter
                ? formatMessage(messages.durationStatTooltipMessage)
                : undefined
            }
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
            tooltipContent={
              projectFilter
                ? formatMessage(messages.pageViewsStatTooltipMessage)
                : undefined
            }
          />
        </Box>
      </Box>
    </>
  );
};

export default injectIntl(VisitorStats);
