import React, { useRef } from 'react';

// hooks
import useRegistrations from '../../hooks/useRegistrations';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
// import Statistic from 'components/admin/Graphs/Statistic';
// import Chart from './Chart';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
// import { BOTTOM_LABEL_COPY } from '../VisitorsCard/VisitorStats';
// import { emptyStatsData } from './generateEmptyData';

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
  // projectFilter,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const x = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(x)) {
    return null;
  }

  const cardTitle = formatMessage(messages.activeUsers);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  // const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

  // const shownStatsData = projectFilter ? emptyStatsData : stats;

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: undefined, // TODO
        startAt,
        endAt,
        // resolution: deducedResolution,
      }}
    >
      <Box px="20px" display="flex" flexDirection="row">
        {/* TODO */}
      </Box>
    </GraphCard>
  );
};

export default RegistrationsCard;
