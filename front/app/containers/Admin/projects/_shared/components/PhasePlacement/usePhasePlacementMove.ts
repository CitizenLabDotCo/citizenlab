import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { IPhaseData, PhasePlacementType } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import { linkedSurveyPhaseIds } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/linkedSurveyPhaseIds';

import {
  checkMoveToSpotlightSurveys,
  checkMoveToTimeline,
  invalidTimelineDates,
  getPhaseDateErrors,
} from './utils';

export type PlacementDates = Pick<
  IPhaseData['attributes'],
  'start_at' | 'end_at'
>;

const usePhasePlacementMove = (phase: IPhaseData) => {
  const { mutate: updatePhase, isPending, error, reset } = useUpdatePhase();
  const queryClient = useQueryClient();
  const projectId = phase.relationships.project.data.id;
  const onTimeline = isTimelinePhase(phase);
  const { data: layout } = useProjectPageLayout(projectId, !onTimeline);
  const { data: timelinePhases } = usePhases(projectId, 'on_timeline');
  const [dateChanges, setDateChanges] = useState<
    Record<string, PlacementDates>
  >({});
  const withDraftDates = (phase: IPhaseData): IPhaseData => ({
    ...phase,
    attributes: { ...phase.attributes, ...dateChanges[phase.id] },
  });
  const draftPhase = withDraftDates(phase);
  const draftTimeline = timelinePhases?.data.map(withDraftDates) ?? [];
  const proposedTimeline = [
    ...(timelinePhases?.data.filter(({ id }) => id !== phase.id) ?? []),
    phase,
  ]
    .sort(
      (a, b) =>
        Date.parse(a.attributes.start_at) - Date.parse(b.attributes.start_at)
    )
    .map(withDraftDates);

  const target: PhasePlacementType = onTimeline ? 'standalone' : 'on_timeline';
  const toTimelineCheck =
    !onTimeline && timelinePhases
      ? checkMoveToTimeline(draftPhase, draftTimeline)
      : undefined;
  const toSpotlightCheck =
    onTimeline && timelinePhases
      ? checkMoveToSpotlightSurveys(draftPhase, draftTimeline)
      : undefined;
  const invalidDates = onTimeline ? [] : invalidTimelineDates(proposedTimeline);
  const blocked = invalidDates.length > 0;
  const dateConflictCount = new Set(
    invalidDates.flatMap((invalidPhase) =>
      getPhaseDateErrors(invalidPhase, proposedTimeline).map((error) =>
        'phase' in error
          ? [invalidPhase.id, error.phase.id].sort().join(':')
          : `${invalidPhase.id}:${error.type}`
      )
    )
  ).size;

  const move = ({ onSuccess }: { onSuccess: (phase: IPhaseData) => void }) => {
    updatePhase(
      {
        phaseId: phase.id,
        placement_type: target,
        ...dateChanges[phase.id],
        timeline_phase_dates: Object.entries(dateChanges)
          .filter(([id]) => id !== phase.id)
          .map(([id, dates]) => ({ id, ...dates })),
      },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({
            queryKey: projectPageLayoutKeys.item({ projectId }),
          });
          onSuccess(response.data);
        },
      }
    );
  };

  return {
    onTimeline,
    loaded: !!timelinePhases && (onTimeline || !!layout),
    toTimelineCheck,
    toSpotlightCheck,
    blocked,
    draftPhase,
    proposedTimeline,
    invalidDates,
    dateConflictCount,
    datesChanged: Object.keys(dateChanges).length > 0,
    changeDates: (id: string, dates: PlacementDates) => {
      reset();
      setDateChanges((changes) => ({ ...changes, [id]: dates }));
    },
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
