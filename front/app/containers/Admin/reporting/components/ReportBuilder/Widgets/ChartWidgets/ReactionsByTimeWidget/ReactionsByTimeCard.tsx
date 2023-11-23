import React, { useMemo } from 'react';

// hooks
import useReactionsByTime from './useReactionsByTime';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'api/phases/usePhases';

// router
import { useParams } from 'react-router-dom';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import Chart from 'components/admin/GraphCards/ReactionsByTimeCard/Chart';

// i18n
import messages from '../messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
// utils
import { getLatestRelevantPhase } from 'api/phases/utils';
import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';

type Props = ProjectId & Dates & Resolution;

type InnerProps = Props & { reportId?: string };

const ReactionsByTime = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  reportId,
}: InnerProps) => {
  const { currentResolution, timeSeries } = useReactionsByTime({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
    reportId,
  });

  if (isNilOrError(timeSeries)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box
      id="e2e-reactions-by-time-widget"
      width="100%"
      height="220px"
      mt="20px"
      pb="8px"
      px="16px"
    >
      <Box pt="8px" width="95%" height="95%" maxWidth="800px">
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={currentResolution}
        />
      </Box>
    </Box>
  );
};

const ReactionsByTimeWrapper = (props: Props) => {
  const { slug, phaseNumber } = useParams();
  const { data: project } = useProjectBySlug(slug);
  const { data: phases } = usePhases(project?.data.id);

  const selectedPhase = useMemo(() => {
    if (!phases) return;

    // if a phase parameter was provided, and it is valid, we set that as phase.
    // otherwise, use the most logical phase
    if (isValidPhase(phaseNumber, phases.data)) {
      const phaseIndex = Number(phaseNumber) - 1;
      return phases.data[phaseIndex];
    }

    return getLatestRelevantPhase(phases.data);
  }, [phaseNumber, phases]);

  const reportId = selectedPhase?.relationships.report?.data?.id;

  return <ReactionsByTime {...props} reportId={reportId} />;
};

export default ReactionsByTimeWrapper;
