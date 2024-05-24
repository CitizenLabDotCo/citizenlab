import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import { getTimePeriodTranslationByResolution } from 'components/admin/GraphCards/_utils/resolution';
import { MARGINS } from 'components/admin/GraphCards/_utils/style';
import {
  ProjectId,
  Dates,
  Resolution,
  Layout,
} from 'components/admin/GraphCards/typings';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Chart from './Chart';
import { emptyStatsData } from './generateEmptyData';
import messages from './messages';
import useRegistrations from './useRegistrations';

type Props = ProjectId &
  Dates &
  Resolution & {
    layout?: Layout;
    hideRegistrationRate?: boolean;
  };

const RegistrationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
  hideRegistrationRate = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, stats, xlsxData, currentResolution } = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = formatMessage(messages.registrations);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const bottomLabel = getTimePeriodTranslationByResolution(
    formatMessage,
    resolution
  );

  const shownStatsData = projectId ? emptyStatsData : stats;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
      }}
    >
      <Box display="flex" flexDirection={layout === 'wide' ? 'row' : 'column'}>
        <Box
          width="initial"
          display="flex"
          pl="20px"
          flexDirection={layout === 'narrow' ? 'row' : 'column'}
        >
          <Box width={layout === 'narrow' ? '50%' : undefined}>
            <Statistic
              name={formatMessage(messages.totalRegistrations)}
              value={shownStatsData?.registrations.value ?? '-'}
              bottomLabel={bottomLabel}
              bottomLabelValue={shownStatsData?.registrations.lastPeriod ?? '-'}
            />
          </Box>
          {!hideRegistrationRate && (
            <Box
              mt={layout === 'wide' ? '32px' : 'auto'}
              ml={layout === 'narrow' ? '32px' : 'auto'}
              width={layout === 'narrow' ? '50%' : 'auto'}
            >
              <Statistic
                name={formatMessage(messages.registrationRate)}
                tooltipContent={formatMessage(messages.registrationRateTooltip)}
                value={shownStatsData?.registrationRate.value ?? '-'}
                bottomLabel={bottomLabel}
                bottomLabelValue={
                  shownStatsData?.registrationRate.lastPeriod ?? '-'
                }
              />
            </Box>
          )}
        </Box>
        {layout === 'wide' && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" pr="20px">
            <Box pt="8px" height="250px" width="95%" maxWidth="800px" mt="-1px">
              <Chart
                timeSeries={timeSeries}
                projectId={projectId}
                startAtMoment={startAtMoment}
                endAtMoment={endAtMoment}
                resolution={currentResolution}
                innerRef={graphRef}
                margin={MARGINS[layout]}
              />
            </Box>
          </Box>
        )}

        {layout === 'narrow' && (
          <Box width="100%" height="250px" mt="30px">
            <Chart
              timeSeries={timeSeries}
              projectId={projectId}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={currentResolution}
              innerRef={graphRef}
              margin={MARGINS[layout]}
            />
          </Box>
        )}
      </Box>
    </GraphCard>
  );
};

export default RegistrationsCard;
