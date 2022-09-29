import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { MessageDescriptor } from 'typings';
import { Stats } from '../../hooks/useVisitorsData/typings';

interface Props {
  stats: Stats | NilOrError;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const BOTTOM_LABEL_COPY: Record<IResolution, MessageDescriptor> = {
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
}: Props & InjectedIntlProps) => {
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);
  const emptyTooltipContent = formatMessage(messages.emptyStatTooltipMessage);

  return (
    <>
      <Box>
        <Statistic
          name={formatMessage(messages.visitors)}
          value={shownStats.visitors.value.toLocaleString()}
          bottomLabel={bottomLabel}
          bottomLabelValue={shownStats.visitors.lastPeriod}
          tooltipContent={formatMessage(messages.visitorsStatTooltipMessage)}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.visitDuration)}
            value={shownStats.visitDuration.value.toLocaleString()}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStats.visitDuration.lastPeriod}
            emptyTooltipContent={
              projectFilter ? emptyTooltipContent : undefined
            }
          />
        </Box>
      </Box>
      <Box ml="28px">
        <Statistic
          name={formatMessage(messages.visits)}
          value={shownStats.visits.value.toLocaleString()}
          bottomLabel={bottomLabel}
          bottomLabelValue={shownStats.visits.lastPeriod}
          tooltipContent={formatMessage(messages.visitsStatTooltipMessage)}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.pageViews)}
            value={shownStats.pageViews.value.toLocaleString()}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStats.pageViews.lastPeriod}
            emptyTooltipContent={
              projectFilter ? emptyTooltipContent : undefined
            }
          />
        </Box>
      </Box>
    </>
  );
};

export default injectIntl(VisitorStats);
