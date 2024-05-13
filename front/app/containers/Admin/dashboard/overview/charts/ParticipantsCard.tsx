import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import { MARGINS } from 'components/admin/GraphCards/_utils/style';
import Chart from 'components/admin/GraphCards/ActiveUsersCard/Chart';
import actveUsersCardMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';
import useActiveUsers from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers';
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

import { useIntl } from 'utils/cl-intl';

type Props = ProjectId & Dates & Resolution;

const ParticipantsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, xlsxData, currentResolution } = useActiveUsers({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = formatMessage(actveUsersCardMessages.participants);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      infoTooltipContent={formatMessage(
        actveUsersCardMessages.cardTitleTooltipMessage
      )}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: xlsxData ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
      }}
    >
      <Box
        w="100%"
        display="flex"
        justifyContent="flex-start"
        id="e2e-participants-by-time-chart"
      >
        <Box
          pt="8px"
          height="200px"
          width="95%"
          maxWidth="700px"
          mt="-1px"
          ml="-16px"
        >
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={currentResolution}
            innerRef={graphRef}
            margin={MARGINS.wide}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default ParticipantsCard;
