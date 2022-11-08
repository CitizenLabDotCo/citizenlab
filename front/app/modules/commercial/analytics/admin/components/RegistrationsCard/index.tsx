import React, { useRef } from 'react';

// hooks
import useRegistrations from '../../hooks/useRegistrations';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';
import Chart from './Chart';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { BOTTOM_LABEL_COPY } from '../VisitorsCard/VisitorStats';
import { emptyStatsData } from './generateEmptyData';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  projectFilter?: string;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  resolution: IResolution;
}

const RegistrationsCard = ({
  projectFilter,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, deducedResolution } = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats)) {
    return null;
  }

  const cardTitle = formatMessage(messages.registrations);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

  const shownStatsData = projectFilter ? emptyStatsData : stats;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: deducedResolution,
      }}
    >
      <Box px="20px" display="flex" flexDirection="row">
        <Box width="initial">
          <Statistic
            name={formatMessage(messages.totalRegistrations)}
            value={shownStatsData.registrations.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStatsData.registrations.lastPeriod}
          />
          <Box mt="32px">
            <Statistic
              name={formatMessage(messages.conversionRate)}
              value={shownStatsData.conversionRate.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData.conversionRate.lastPeriod}
            />
          </Box>
        </Box>
        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Chart
            timeSeries={timeSeries}
            projectFilter={projectFilter}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={deducedResolution}
            innerRef={graphRef}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default RegistrationsCard;
