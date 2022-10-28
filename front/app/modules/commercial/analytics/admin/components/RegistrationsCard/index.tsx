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
import { Layout } from '../typings';

interface Props {
  projectFilter?: string;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  resolution: IResolution;
  layout?: Layout;
}

const RegistrationsCard = ({
  projectFilter,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
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
      <Box
        px="20px"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        <Box
          width="initial"
          display="flex"
          flexDirection={layout === 'narrow' ? 'row' : 'column'}
          justifyContent={layout === 'narrow' ? 'center' : undefined}
        >
          <Statistic
            name={formatMessage(messages.totalRegistrations)}
            value={shownStatsData.registrations.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={shownStatsData.registrations.lastPeriod}
          />
          <Box {...(layout === 'wide' ? { mt: '32px' } : { ml: '32px' })}>
            <Statistic
              name={formatMessage(messages.conversionRate)}
              value={shownStatsData.conversionRate.value}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData.conversionRate.lastPeriod}
            />
          </Box>
        </Box>
        <Box
          {...(layout === 'wide'
            ? {
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'flex-end',
              }
            : {
                width: '100%',
                mt: '20px',
              })}
        >
          <Box
            pt="8px"
            height="250px"
            {...(layout === 'wide'
              ? {
                  width: '95%',
                  maxWidth: '800px',
                }
              : {
                  width: '100%',
                })}
          >
            <Chart
              timeSeries={timeSeries}
              projectFilter={projectFilter}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={deducedResolution}
              innerRef={graphRef}
              layout={layout}
            />
          </Box>
        </Box>
      </Box>
    </GraphCard>
  );
};

export default RegistrationsCard;
