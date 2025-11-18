import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'component-library/utils/typings';
import moment from 'moment';

import useLocalize from 'hooks/useLocalize';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import { TimeSeries } from 'components/admin/GraphCards/VisitorsCard/useVisitors/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { formatLargeNumber, getDaysInRange } from '../../utils';
import { Stats } from '../typings';

import {
  AbsoluteStatistic,
  OtherStatistic,
  getDurationDeltaSign,
  getPageViewsDeltaSign,
} from './Statistics';

export interface Props {
  startAt?: string;
  endAt?: string | null;
  currentResolution: IResolution;
  stats: Stats;
  timeSeries: TimeSeries | null;
  hideStatistics?: boolean;
  ariaLabel?: Multiloc;
  description?: Multiloc;
}

const Wide = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
  hideStatistics,
  ariaLabel,
  description,
}: Props) => {
  const previousDays = getDaysInRange(startAt, endAt);
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  // Generate unique IDs for ARIA attributes
  const chartId = React.useId();
  const descriptionId = `${chartId}-description`;

  // Get localized values
  const localizedAriaLabel = ariaLabel ? localize(ariaLabel) : undefined;
  const localizedDescription = description ? localize(description) : undefined;

  return (
    <Box
      width="100%"
      pb="8px"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && (
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box maxWidth="25%" pr="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visitors}
              tooltipMessage={visitorsCardMessages.visitorsStatTooltipMessage}
              stat={stats.visitors}
              previousDays={previousDays}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              tooltipMessage={visitorsCardMessages.visitsStatTooltipMessage}
              stat={stats.visits}
              previousDays={previousDays}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <OtherStatistic
              nameMessage={visitorsCardMessages.visitDuration}
              stat={stats.visitDuration}
              previousDays={previousDays}
              sign={getDurationDeltaSign(stats.visitDuration.delta)}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <OtherStatistic
              nameMessage={visitorsCardMessages.pageViews}
              stat={stats.pageViews}
              previousDays={previousDays}
              sign={getPageViewsDeltaSign(stats.pageViews.delta)}
            />
          </Box>
        </Box>
      )}

      {/* Chart container with ARIA attributes */}
      <Box
        role="img"
        aria-label={localizedAriaLabel || 'Visitors chart'}
        aria-describedby={localizedDescription ? descriptionId : undefined}
        flexGrow={1}
        display="flex"
        justifyContent="flex-start"
        mt="28px"
        maxWidth="800px"
        h="240px"
      >
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          yaxis={{
            orientation: 'right',
            tickFormatter: formatLargeNumber,
          }}
          margin={{ top: 0, right: -16, bottom: 0, left: 0 }}
        />
      </Box>

      {/* description for screen readers */}
      {localizedDescription && (
        <Text color="grey700" fontSize="s" id={descriptionId}>
          {formatMessage(messages.description)} {localizedDescription}
        </Text>
      )}
    </Box>
  );
};

export default Wide;
