import { useQueryClient } from '@tanstack/react-query';

import { IPhaseData, PhasePlacementType } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import { linkedSurveyPhaseIds } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/linkedSurveyPhaseIds';

import { checkMoveToSpotlightSurveys, checkMoveToTimeline } from './utils';

const usePhasePlacementMove = (phase: IPhaseData) => {
  const { mutate: updatePhase, isPending, error, reset } = useUpdatePhase();
  const queryClient = useQueryClient();
  const projectId = phase.relationships.project.data.id;
  const onTimeline = isTimelinePhase(phase);
  const { data: layout } = useProjectPageLayout(projectId, !onTimeline);
  const { data: timelinePhases } = usePhases(projectId, 'on_timeline');

  const target: PhasePlacementType = onTimeline ? 'standalone' : 'on_timeline';
  const toTimelineCheck =
    !onTimeline && timelinePhases
      ? checkMoveToTimeline(phase, timelinePhases.data)
      : undefined;
  const toSpotlightCheck =
    onTimeline && timelinePhases
      ? checkMoveToSpotlightSurveys(phase, timelinePhases.data)
      : undefined;
  const blocked =
    !!toTimelineCheck &&
    (toTimelineCheck.overlappingPhases.length > 0 ||
      toTimelineCheck.openEndedNotLast);

  const move = ({ onSuccess }: { onSuccess: () => void }) => {
    updatePhase(
      { phaseId: phase.id, placement_type: target },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: projectPageLayoutKeys.item({ projectId }),
          });
          onSuccess();
        },
      }
    );
  };

  return {
    onTimeline,
    loaded: !!timelinePhases,
    toTimelineCheck,
    toSpotlightCheck,
    blocked,
    shownOnProjectPage: linkedSurveyPhaseIds(
      layout?.data.attributes.craftjs_json
    ).has(phase.id),
    move,
    isPending,
    errors: error?.errors ?? null,
    reset,
  };
};

export type PhasePlacementMove = ReturnType<typeof usePhasePlacementMove>;

export default usePhasePlacementMove;
