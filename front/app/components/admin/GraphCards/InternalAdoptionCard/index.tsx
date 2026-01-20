import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import { getTimePeriodTranslationByResolution } from '../_utils/resolution';

import Chart from './Chart';
import messages from './messages';
import { Props } from './typings';
import useInternalAdoption from './useInternalAdoption';

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
  const bottomLabel = getTimePeriodTranslationByResolution(
    formatMessage,
    resolution
  );
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

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
            name={formatMessage(messages.activeAdmins)}
            value={stats.activeAdmins.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.activeAdmins.lastPeriod?.toString() ?? '-'}
          />
          <Statistic
            name={formatMessage(messages.activeModerators)}
            value={stats.activeModerators.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={
              stats.activeModerators.lastPeriod?.toString() ?? '-'
            }
          />
          <Statistic
            name={formatMessage(messages.totalAdminPm)}
            value={stats.totalAdminPm.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.totalAdminPm.lastPeriod?.toString() ?? '-'}
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
