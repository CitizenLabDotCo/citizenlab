import { first, last, sortBy } from 'lodash-es';
import { MessageDescriptor } from 'react-intl';
import { SupportedLocale } from 'typings';

import { IIdeaData } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';

import { pastPresentOrFutureWithTimezone } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { hasTextInSpecifiedLocale } from 'utils/locale';

import { IPhaseData, VoteTerm } from './types';

export function canContainIdeas(phase: IPhaseData) {
  const pm = phase.attributes.participation_method;
  return pm === 'ideation' || pm === 'voting';
}

export function getCurrentPhase(
  phases: IPhaseData[] | undefined,
  timeZone?: string
) {
  if (!isNilOrError(phases)) {
    const currentPhase = phases.find(
      (phase) =>
        pastPresentOrFutureWithTimezone({
          startDate: phase.attributes.start_at,
          endDate: phase.attributes.end_at,
          timeZone: timeZone || 'UTC',
        }) === 'present'
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

export function getLastPastPhase(
  phases: IPhaseData[] | undefined,
  timeZone: string
) {
  if (!isNilOrError(phases) && phases.length > 0) {
    const pastPhases = phases.filter(
      (phase) =>
        pastPresentOrFutureWithTimezone({
          startDate: phase.attributes.start_at,
          endDate: phase.attributes.end_at,
          timeZone,
        }) === 'past'
    );

    const lastPastActivePhase = last(
      sortBy(pastPhases, [(phase) => phase.attributes.end_at])
    );

    return lastPastActivePhase || null;
  }

  return null;
}

export function getLatestRelevantPhase(
  phases: IPhaseData[],
  timeZone: string = 'UTC'
) {
  const currentPhase = getCurrentPhase(phases, timeZone);
  const firstPhase = getFirstPhase(phases);
  const lastPhase = getLastPhase(phases);
  const lastPastPhase = getLastPastPhase(phases, timeZone);

  if (currentPhase) {
    return currentPhase;
  } else if (
    firstPhase &&
    pastPresentOrFutureWithTimezone({
      startDate: firstPhase.attributes.start_at,
      endDate: firstPhase.attributes.end_at,
      timeZone,
    }) === 'future'
  ) {
    return firstPhase;
  } else if (
    lastPastPhase &&
    lastPhase &&
    pastPresentOrFutureWithTimezone({
      startDate: lastPhase.attributes.start_at,
      endDate: lastPhase.attributes.end_at,
      timeZone,
    }) === 'future'
  ) {
    return lastPastPhase;
  } else {
    return lastPhase;
  }
}

export const isIdeaInParticipationContext = (
  idea: IIdeaData,
  participationContext: IProjectData | IPhaseData
) => {
  if (participationContext.type === 'project') {
    return idea.relationships.project.data.id === participationContext.id;
  }

  return idea.relationships.phases.data.some(
    (phase) => participationContext.id === phase.id
  );
};

// If a timeline project has no description,
// no end date and only one phase, we don't show the multiple phase ui (timeline)
export const hideTimelineUI = (
  phasesData: IPhaseData[] | undefined,
  currentLocale: SupportedLocale
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

export function getInputTerm(
  phases: IPhaseData[] | undefined,
  phase?: IPhaseData | undefined | null | Error,
  timeZone: string = 'UTC'
) {
  // (2020/12/9): When a new timeline project is created, phases will initially
  // be []. To make sure we don't break copy that depends on an input_term,
  // we have the fallback to idea here in that case.
  if (!isNilOrError(phase)) {
    return (
      getLatestRelevantPhase([phase], timeZone)?.attributes.input_term || 'idea'
    );
  } else if (phases && phases.length > 0) {
    return (
      getLatestRelevantPhase(phases, timeZone)?.attributes.input_term || 'idea'
    );
  }
  return 'idea';
}

export function getPhaseVoteTermMessage(
  phase: IPhaseData,
  voteTermMessages: { [key in VoteTerm]: MessageDescriptor }
) {
  const voteTermMessageKey = phase.attributes.vote_term || 'vote';
  return voteTermMessages[voteTermMessageKey];
}

export function getPhaseLandingTab(
  phase: IPhaseData
):
  | 'setup'
  | 'ideas'
  | 'proposals'
  | 'insights'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'proposals') {
    return 'proposals';
  } else if (participationMethod === 'native_survey') {
    return 'insights';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}

export const INPUT_TERMS = [
  'idea',
  'option',
  'project',
  'question',
  'issue',
  'contribution',
  'proposal',
  'initiative',
  'petition',
  'comment',
  'response',
  'suggestion',
  'topic',
  'post',
  'story',
];

export const IdeaSortMethodFallback = 'trending';
