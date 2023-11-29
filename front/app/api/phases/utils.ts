import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { first, last, sortBy } from 'lodash-es';
import { IPhaseData } from './types';
import { IProjectData } from 'api/projects/types';
import { IIdea } from 'api/ideas/types';
import { Locale } from 'typings';
import { hasTextInSpecifiedLocale } from 'utils/locale';

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

// TODO: JS - Remove and replace everywhere with getCurrentPhase
export const getCurrentParticipationContext = (
  project?: IProjectData,
  phases?: IPhaseData[]
) => {
  if (!project) return;

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

// If a timeline project has no description,
// no end date and only one phase, we don't show the multiple phase ui (timeline)
export const hideTimelineUI = (
  phasesData: IPhaseData[] | undefined,
  currentLocale: Locale
) => {
  const hasOnePhase = phasesData?.length === 1;
  const phaseDescription = hasOnePhase
    ? phasesData[0].attributes.description_multiloc
    : {};
  const hasEmptyPhaseDescription =
    hasOnePhase && !hasTextInSpecifiedLocale(phaseDescription, currentLocale);
  const hasNoEndDate = hasOnePhase && phasesData[0].attributes.end_at === null;
  return hasEmptyPhaseDescription && hasNoEndDate;
};
