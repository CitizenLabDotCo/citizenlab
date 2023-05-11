import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';
import { pastPresentOrFuture } from 'utils/dateUtils';
import {
  ParticipationMethod,
  TSurveyService,
  IdeaDefaultSortMethod,
  InputTerm,
  VotingMethod,
  PresentationMode,
} from './participationContexts';
import { isNilOrError } from 'utils/helperUtils';
import { first, last, sortBy } from 'lodash-es';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

const apiEndpoint = `${API_PATH}/phases`;

export interface IPhaseData {
  id: string;
  type: string;
  attributes: IPhaseAttributes;
  relationships: {
    permissions: {
      data: IRelationship[];
    };
    project: {
      data: IRelationship;
    };
    user_basket?: {
      data: IRelationship | null;
    };
  };
}

export interface IPhaseAttributes {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_term: InputTerm;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
  commenting_enabled: boolean;
  voting_enabled: boolean;
  upvoting_method: VotingMethod;
  upvoting_limited_max: number;
  downvoting_method: VotingMethod;
  downvoting_enabled: boolean;
  downvoting_limited_max: number;
  presentation_mode: PresentationMode;
  min_budget?: number;
  max_budget?: number;
  survey_service?: TSurveyService;
  survey_embed_url?: string;
  poll_anonymous?: boolean;
  ideas_count: number;
  ideas_order?: IdeaDefaultSortMethod;
}

export interface IPhase {
  data: IPhaseData;
}

export interface IUpdatedPhaseProperties {
  project_id?: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  input_term?: InputTerm;
  start_at?: string;
  end_at?: string;
  participation_method?: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  upvoting_method?: 'limited' | 'unlimited' | null;
  downvoting_method?: 'limited' | 'unlimited' | null;
  upvoting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  downvoting_limited_max?: number | null;
  presentation_mode?: 'card' | 'map' | null;
  min_budget?: number | null;
  max_budget?: number | null;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  ideas_order?: IdeaDefaultSortMethod;
}

export function phaseStream(
  phaseID: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPhase>({
    apiEndpoint: `${apiEndpoint}/${phaseID}`,
    ...streamParams,
  });
}

export async function updatePhase(
  phaseId: string,
  object: IUpdatedPhaseProperties
) {
  const response = await streams.update<IPhase>(
    `${apiEndpoint}/${phaseId}`,
    phaseId,
    { phase: object }
  );

  const projectId = response.data.relationships.project.data.id;
  queryClient.invalidateQueries({
    queryKey: projectsKeys.item({ id: projectId }),
  });

  streams.fetchAllWith({
    dataId: [phaseId],
    partialApiEndpoint: [`${API_PATH}/baskets`],
  });

  return response;
}

export async function addPhase(
  projectId: string,
  object: IUpdatedPhaseProperties
) {
  const response = await streams.add<IPhase>(
    `${API_PATH}/projects/${projectId}/phases`,
    { phase: object }
  );
  queryClient.invalidateQueries({
    queryKey: projectsKeys.item({ id: projectId }),
  });

  const phaseId = response.data.id;
  streams.fetchAllWith({ dataId: [phaseId] });
  return response;
}

export async function deletePhase(projectId: string, phaseId: string) {
  const response = await streams.delete(`${apiEndpoint}/${phaseId}`, phaseId);
  queryClient.invalidateQueries({
    queryKey: projectsKeys.item({ id: projectId }),
  });
  queryClient.invalidateQueries({
    queryKey: phasesKeys.list({ projectId }),
  });
  return response;
}

export function canContainIdeas(phase: IPhaseData) {
  const pm = phase.attributes.participation_method;
  return pm === 'ideation' || pm === 'budgeting';
}

export function getCurrentPhase(
  phases: IPhaseData[] | null | undefined | Error
) {
  if (!isNilOrError(phases)) {
    const currentPhase = phases.find(
      (phase) =>
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) === 'present'
    );

    return currentPhase || null;
  }

  return null;
}

export function getFirstPhase(phases: IPhaseData[] | null | undefined | Error) {
  if (!isNilOrError(phases)) {
    const firstPhase = first(
      sortBy(phases, [(phase) => phase.attributes.start_at])
    );

    return firstPhase || null;
  }

  return null;
}

export function getLastPhase(phases: IPhaseData[] | null | undefined | Error) {
  if (!isNilOrError(phases)) {
    const lastPhase = last(
      sortBy(phases, [(phase) => phase.attributes.end_at])
    );

    return lastPhase || null;
  }

  return null;
}

export function getLastPastPhase(
  phases: IPhaseData[] | null | undefined | Error
) {
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
