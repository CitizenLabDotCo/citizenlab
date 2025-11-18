import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLocalize from 'hooks/useLocalize';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { formatLargeNumber, getDaysInRange } from '../../utils';

import {
  AbsoluteStatistic,
  OtherStatistic,
  getDurationDeltaSign,
  getPageViewsDeltaSign,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
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
    <Box height="100%" display="flex" flexDirection="column">
      {!hideStatistics && (
        <Box display="flex" flexDirection="column" mb="8px">
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visitors}
            tooltipMessage={visitorsCardMessages.visitorsStatTooltipMessage}
            stat={stats.visitors}
            previousDays={previousDays}
          />
          <Box mt="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              tooltipMessage={visitorsCardMessages.visitsStatTooltipMessage}
              stat={stats.visits}
              previousDays={previousDays}
            />
          </Box>
          <Box mt="12px">
            <OtherStatistic
              nameMessage={visitorsCardMessages.visitDuration}
              stat={stats.visitDuration}
              previousDays={previousDays}
              sign={getDurationDeltaSign(stats.visitDuration.delta)}
            />
          </Box>
          <Box mt="12px">
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
        pt="8px"
        width="100%"
        h="200px"
      >
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          margin={{
            left: 5,
            right: -20,
            top: 0,
            bottom: 0,
          }}
          yaxis={{
            orientation: 'right',
            tickFormatter: formatLargeNumber,
          }}
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

export default Narrow;
