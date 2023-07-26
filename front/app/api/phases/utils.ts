import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { first, last, sortBy } from 'lodash-es';
import { IPhaseData } from './types';
import { IProjectData } from 'api/projects/types';
import { IIdea } from 'api/ideas/types';

export function canContainIdeas(phase: IPhaseData) {
  const pm = phase.attributes.participation_method;
  return pm === 'ideation' || pm === 'voting';
}

export function getCurrentPhase(phases: IPhaseData[] | undefined) {
  if (!isNilOrError(phases)) {
    const currentPhase = phases.find(
      (phase) =>
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) === 'present'
    );

    return currentPhase;
  }

  return;
}

export function getFirstPhase(phases: IPhaseData[] | undefined) {
  if (!isNilOrError(phases)) {
    const firstPhase = first(
      sortBy(phases, [(phase) => phase.attributes.start_at])
    );

    return firstPhase || null;
  }

  return null;
}

export function getLastPhase(phases: IPhaseData[] | undefined) {
  if (!isNilOrError(phases)) {
    const lastPhase = last(
      sortBy(phases, [(phase) => phase.attributes.end_at])
    );

    return lastPhase;
  }

  return;
}

export function getLastPastPhase(phases: IPhaseData[] | undefined) {
  if (!isNilOrError(phases) && phases.length > 0) {
    const pastPhases = phases.filter(
      (phase) =>
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) === 'past'
    );

    const lastPastActivePhase = last(
      sortBy(pastPhases, [(phase) => phase.attributes.end_at])
    );

    return lastPastActivePhase || null;
  }

  return null;
}

export function getLatestRelevantPhase(phases: IPhaseData[]) {
  const currentPhase = getCurrentPhase(phases);
  const firstPhase = getFirstPhase(phases);
  const lastPhase = getLastPhase(phases);
  const lastPastPhase = getLastPastPhase(phases);

  if (currentPhase) {
    return currentPhase;
  } else if (
    firstPhase &&
    pastPresentOrFuture([
      firstPhase.attributes.start_at,
      firstPhase.attributes.end_at,
    ]) === 'future'
  ) {
    return firstPhase;
  } else if (
    lastPastPhase &&
    lastPhase &&
    pastPresentOrFuture([
      lastPhase.attributes.start_at,
      lastPhase.attributes.end_at,
    ]) === 'future'
  ) {
    return lastPastPhase;
  } else {
    return lastPhase;
  }
}

export function getPhaseInputTerm(phases: IPhaseData[]) {
  // In practice, this fallback will never be needed.
  // This function will only get called when phases.length > 0,
  // so getLatestRelevantPhase will never return null, but the
  // functions that are used internally by getLatestRelevantPhase
  // can in theory return null. Hence the fallback || 'idea' for typing purposes.
  return getLatestRelevantPhase(phases)?.attributes.input_term || 'idea';
}

export const getCurrentParticipationContext = (
  project?: IProjectData,
  phases?: IPhaseData[]
) => {
  if (!project) return;

  if (project.attributes.process_type === 'continuous') return project;
  return getCurrentPhase(phases);
};

export const isIdeaInParticipationContext = (
  idea: IIdea,
  participationContext: IProjectData | IPhaseData
) => {
  if (participationContext.type === 'project') {
    return idea.data.relationships.project.data.id === participationContext.id;
  }

  return idea.data.relationships.phases.data.some(
    (phase) => participationContext.id === phase.id
  );
};

const pastOrPresent = new Set(['past', 'present']);
const presentOrFuture = new Set(['present', 'future']);

export const isCurrentPhase = (phase: IPhaseData) => {
  const phaseStartPeriod = pastPresentOrFuture(phase.attributes.start_at);
  const phaseEndPeriod = pastPresentOrFuture(phase.attributes.end_at);

  if (
    pastOrPresent.has(phaseStartPeriod) &&
    presentOrFuture.has(phaseEndPeriod)
  ) {
    return true;
  }

  return false;
};
