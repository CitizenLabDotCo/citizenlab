import React, { useRef } from 'react';

import useEmailDeliveries from './useEmailDeliveries';

import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import EmailDeliveriesStats from './EmailDeliveriesStats';
import Chart from './Chart';

import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';
import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution;

const EmailDeliveriesCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { currentResolution, stats, timeSeries, xlsxData } = useEmailDeliveries(
    {
      startAtMoment,
      endAtMoment,
      resolution,
    }
  );

  const cardTitle = formatMessage(messages.emails);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: isNilOrError(xlsxData) ? undefined : { data: xlsxData },
        startAt,
        endAt,
        currentProjectFilter: projectId,
        resolution: currentResolution,
      }}
    >
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row">
          <EmailDeliveriesStats stats={stats} />
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="95%" maxWidth="800px" height="250px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={currentResolution}
              innerRef={graphRef}
            />
          </Box>
        </Box>
      </Box>
    </GraphCard>
  );
};

export default EmailDeliveriesCard;
