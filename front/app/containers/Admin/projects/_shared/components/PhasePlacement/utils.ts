import { IPhaseData } from 'api/phases/types';
import { getPreviousTimelinePhase, isTimelinePhase } from 'api/phases/utils';

const time = (date: string) => new Date(date).getTime();

const endTime = (phase: IPhaseData) =>
  phase.attributes.end_at ? time(phase.attributes.end_at) : Infinity;

const otherTimelinePhases = (survey: IPhaseData, phases: IPhaseData[]) =>
  phases.filter((phase) => phase.id !== survey.id && isTimelinePhase(phase));

// Only surveys can run alongside the timeline, so no other method can move.
export const canChangePlacement = (phase: IPhaseData) =>
  phase.attributes.participation_method === 'native_survey';

// Mirrors the timeline rules the back end enforces on save (see
// Phase#validate_no_other_overlapping_phases, #validate_end_at and
// #close_previous_open_phase), so the admin learns about them before moving.
export const checkMoveToTimeline = (
  survey: IPhaseData,
  timelinePhases: IPhaseData[]
) => {
  const others = otherTimelinePhases(survey, timelinePhases);
  const start = time(survey.attributes.start_at);
  const end = endTime(survey);

  const overlappingPhases = others.filter((other) => {
    const otherStart = time(other.attributes.start_at);
    // An open-ended phase that starts earlier gets closed instead.
    if (!other.attributes.end_at && otherStart < start) return false;
    return start < endTime(other) && otherStart < end;
  });
  const openEndedNotLast =
    !survey.attributes.end_at &&
    others.some((other) => time(other.attributes.start_at) >= start);
  const previousPhase = getPreviousTimelinePhase(others, survey);

  return {
    overlappingPhases,
    openEndedNotLast,
    phaseToClose:
      previousPhase && !previousPhase.attributes.end_at
        ? previousPhase
        : undefined,
    renumbersLaterPhases: others.some(
      (other) => time(other.attributes.start_at) > start
    ),
  };
};

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
