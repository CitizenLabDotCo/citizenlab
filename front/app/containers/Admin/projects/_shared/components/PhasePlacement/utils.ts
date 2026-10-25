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
  const end = endTime(survey);

  const overlappingPhases = others.filter((other) => {
    const otherStart = time(other.attributes.start_at);
    return start < endTime(other) && otherStart < end;
  });
  const openEndedNotLast =
    !survey.attributes.end_at &&
    others.some((other) => time(other.attributes.start_at) >= start);
  return {
    overlappingPhases,
    openEndedNotLast,
    renumbersLaterPhases: others.some(
      (other) => time(other.attributes.start_at) > start
    ),
  };
};

export const invalidTimelineDates = (phases: IPhaseData[]) =>
  phases.filter((phase) => {
    const start = time(phase.attributes.start_at);
    const end = endTime(phase);

    return (
      !Number.isFinite(start) ||
      (phase.attributes.end_at !== null && !Number.isFinite(end)) ||
      end - start < 24 * 60 * 60 * 1000 ||
      phases.some(
        (other) =>
          other.id !== phase.id &&
          start < endTime(other) &&
          time(other.attributes.start_at) < end
      )
    );
  });

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
