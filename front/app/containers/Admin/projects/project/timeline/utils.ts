import { IPhase, IPhases } from 'api/phases/types';
import moment from 'moment';

const getPreviousPhase = (
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

export const getMinAllowedPhaseDate = (
  phases: IPhases | undefined,
  currentPhase: IPhase | undefined
) => {
  const previousPhase = getPreviousPhase(phases, currentPhase);

  if (!previousPhase) return undefined;

  const previousPhaseEndDate =
    previousPhase && previousPhase.attributes.end_at
      ? moment(previousPhase.attributes.end_at)
      : null;
  const previousPhaseStartDate =
    previousPhase && previousPhase.attributes.start_at
      ? moment(previousPhase.attributes.start_at)
      : null;

  if (!previousPhaseEndDate && previousPhaseStartDate) {
    return previousPhaseStartDate.add(2, 'day');
  }

  return previousPhaseEndDate ? previousPhaseEndDate.add(1, 'day') : undefined;
};
