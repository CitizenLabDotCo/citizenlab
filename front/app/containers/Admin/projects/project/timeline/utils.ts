import { IPhase, IPhaseData, IPhases } from 'api/phases/types';
import moment from 'moment';

export const getPreviousPhase = (
  phases: IPhases | undefined,
  currentPhase: IPhase | undefined
) => {
  // if it is a new phase
  if (!currentPhase) {
    return phases && phases.data.length
      ? phases.data[phases.data.length - 1]
      : undefined;
  }

  // If it is an existing phase
  const currentPhaseId = currentPhase ? currentPhase.data.id : null;
  const currentPhaseIndex =
    phases && phases.data.findIndex((phase) => phase.id === currentPhaseId);
  const hasPhaseBeforeCurrent = currentPhaseIndex && currentPhaseIndex > 0;

  return phases && hasPhaseBeforeCurrent
    ? phases.data[currentPhaseIndex - 1]
    : undefined;
};

export function getExcludedDates(phases: IPhaseData[]): moment.Moment[] {
  const excludedDates: moment.Moment[] = [];

  phases.forEach((phase) => {
    const startDate = moment(phase.attributes.start_at);

    if (phase.attributes.end_at) {
      // If the phase has both start and end dates, block the range between them
      const endDate = moment(phase.attributes.end_at);
      const numberOfDays = endDate.diff(startDate, 'days');

      for (let i = 0; i <= numberOfDays; i++) {
        const excludedDate = startDate.clone().add(i, 'days');
        excludedDates.push(excludedDate);
      }
    } else {
      // If the phase has no end date, block only the start date
      excludedDates.push(startDate.clone());
    }
  });

  return excludedDates;
}

export function getMaxEndDate(
  phasesWithOutCurrentPhase: IPhaseData[],
  startDate: moment.Moment | null,
  currentPhase?: IPhase
) {
  const sortedPhases = [
    ...phasesWithOutCurrentPhase.map((iteratedPhase) => ({
      startDate: moment(iteratedPhase.attributes.start_at),
      id: iteratedPhase.id,
    })),
    ...(startDate && currentPhase?.data
      ? [{ id: currentPhase.data.id, startDate }]
      : []),
  ].sort((a, b) => a.startDate.diff(b.startDate));

  const currentPhaseIndex = sortedPhases.findIndex(
    (iteratedPhase) => iteratedPhase.id === currentPhase?.data.id
  );
  const hasNextPhase =
    currentPhaseIndex !== -1 &&
    sortedPhases &&
    currentPhaseIndex !== sortedPhases.length - 1;
  const maxEndDate = hasNextPhase
    ? sortedPhases[currentPhaseIndex + 1].startDate
    : undefined;
  return maxEndDate;
}

export function getTimelineTab(
  phase: IPhaseData
):
  | 'setup'
  | 'ideas'
  | 'native-survey'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'native_survey') {
    return 'native-survey';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}
