import { IPhaseData } from 'api/phases/types';
import { getPreviousTimelinePhase, isTimelinePhase } from 'api/phases/utils';

const time = (date: string) => new Date(date).getTime();

const endTime = (phase: IPhaseData) =>
  phase.attributes.end_at ? time(phase.attributes.end_at) : Infinity;

const otherTimelinePhases = (survey: IPhaseData, phases: IPhaseData[]) =>
  phases.filter((phase) => phase.id !== survey.id && isTimelinePhase(phase));

export const canChangePlacement = (phase: IPhaseData) =>
  phase.attributes.participation_method === 'native_survey';

// Require explicit date changes before moving, including for open-ended phases
// that the backend would otherwise close automatically.
export const checkMoveToTimeline = (
  survey: IPhaseData,
  timelinePhases: IPhaseData[]
) => {
  const others = otherTimelinePhases(survey, timelinePhases);
  const start = time(survey.attributes.start_at);
  return {
    renumbersLaterPhases: others.some(
      (other) => time(other.attributes.start_at) > start
    ),
  };
};

export type PhaseDateError =
  | {
      type:
        | 'startRequired'
        | 'endInvalid'
        | 'endBeforeStart'
        | 'durationTooShort';
    }
  | { type: 'endRequired' | 'overlap'; phase: IPhaseData };

export const getPhaseDateErrors = (
  phase: IPhaseData,
  phases: IPhaseData[]
): PhaseDateError[] => {
  const start = time(phase.attributes.start_at);
  const end = endTime(phase);

  if (!Number.isFinite(start)) return [{ type: 'startRequired' }];
  if (phase.attributes.end_at !== null && !Number.isFinite(end)) {
    return [{ type: 'endInvalid' }];
  }
  if (end <= start) return [{ type: 'endBeforeStart' }];
  if (end - start < 24 * 60 * 60 * 1000) {
    return [{ type: 'durationTooShort' }];
  }

  const others = phases.filter((other) => other.id !== phase.id);
  const nextPhase = [...others]
    .sort((a, b) => time(a.attributes.start_at) - time(b.attributes.start_at))
    .find((other) => time(other.attributes.start_at) >= start);

  if (phase.attributes.end_at === null && nextPhase) {
    return [{ type: 'endRequired', phase: nextPhase }];
  }

  return others
    .filter((other) => {
      const otherStart = time(other.attributes.start_at);
      const otherEnd = endTime(other);

      return (
        Number.isFinite(otherStart) &&
        otherEnd > otherStart &&
        start < otherEnd &&
        otherStart < end
      );
    })
    .map((other) => ({ type: 'overlap', phase: other }));
};

export const invalidTimelineDates = (phases: IPhaseData[]) =>
  phases.filter((phase) => getPhaseDateErrors(phase, phases).length > 0);

export const checkMoveToSpotlightSurveys = (
  survey: IPhaseData,
  timelinePhases: IPhaseData[],
  now = Date.now()
) => {
  const others = otherTimelinePhases(survey, timelinePhases);
  const start = time(survey.attributes.start_at);
  const { end_at } = survey.attributes;
  const hasLaterPhases = others.some(
    (other) => time(other.attributes.start_at) > start
  );
  const previousPhase = getPreviousTimelinePhase(others, survey);

  return {
    leavesGap: !!previousPhase && hasLaterPhases && !!end_at,
    newLastPhase:
      !hasLaterPhases && previousPhase?.attributes.end_at
        ? previousPhase
        : undefined,
    ended: !!end_at && time(end_at) <= now,
    renumbersLaterPhases: hasLaterPhases,
  };
};
