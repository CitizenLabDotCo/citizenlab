import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import Chart from './Chart';
import messages from './messages';
import { Props } from './typings';
import useInternalAdoption from './useInternalAdoption';
import { getActiveTimePeriodLabel } from './useInternalAdoption/translations';

const InternalAdoptionCard = ({
  startAtMoment,
  endAtMoment,
  resolution = 'month',
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, currentResolution } =
    useInternalAdoption({
      startAtMoment,
      endAtMoment,
      resolution,
    });

  const cardTitle = formatMessage(messages.internalAdoption);
  const activeBottomLabel = getActiveTimePeriodLabel(formatMessage, resolution);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const registeredAdmins = stats?.admins.registered;
  const registeredModerators = stats?.moderators.registered;
  const totalRegistered = stats?.total.registered;

  return (
    <GraphCard
      title={cardTitle}
      id="e2e-internal-adoption-card"
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: xlsxData ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
      }}
    >
      {stats && (
        <Box
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          gap="16px"
        >
          <Statistic
            name={formatMessage(messages.admins)}
            value={registeredAdmins}
            bottomLabel={activeBottomLabel}
            bottomLabelValue={stats.admins.activeLastPeriod.toString()}
          />
          <Statistic
            name={formatMessage(messages.moderators)}
            value={registeredModerators}
            bottomLabel={activeBottomLabel}
            bottomLabelValue={stats.moderators.activeLastPeriod.toString()}
          />
          <Statistic
            name={formatMessage(messages.total)}
            value={totalRegistered}
            bottomLabel={activeBottomLabel}
            bottomLabelValue={stats.total.activeLastPeriod.toString()}
          />
        </Box>
      )}
      <Box width="100%" height="250px" mt="30px">
        <Chart
          startAtMoment={startAtMoment ?? null}
          endAtMoment={endAtMoment ?? null}
          resolution={currentResolution}
          margin={{ top: 16, left: 42, right: -16 }}
          yaxis={{ orientation: 'right' }}
          timeSeries={timeSeries}
          innerRef={graphRef}
        />
      </Box>
    </GraphCard>
  );
};

export default InternalAdoptionCard;
