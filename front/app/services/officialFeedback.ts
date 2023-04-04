import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasCountKeys from 'api/idea_count/keys';
import initiativesCountKeys from 'api/initiative_counts/keys';

export interface IOfficialFeedbackData {
  id: string;
  type: 'official_feedback';
  attributes: {
    body_multiloc: Multiloc;
    author_multiloc: Multiloc;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    idea: {
      data: IRelationship;
    };
    user: {
      data: IRelationship | null;
    };
  };
}

export interface IOfficialFeedback {
  data: IOfficialFeedbackData;
}

export interface IOfficialFeedbacks {
  data: IOfficialFeedbackData[];
}

export interface INewFeedback {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

// idea

export function officialFeedbacksForIdeaStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IOfficialFeedbacks>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/official_feedback`,
    ...streamParams,
  });
}

export async function deleteOfficialFeedbackFromIdea(ideaId: string) {
  const response = await streams.delete(
    `${API_PATH}/official_feedback/${ideaId}`,
    ideaId
  );
  queryClient.invalidateQueries(ideasCountKeys.all());
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/ideas/${ideaId}/official_feedback`],
  });
  return response;
}

// ------

// initiative

export function officialFeedbacksForInitiativeStream(
  initiativeId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IOfficialFeedbacks>({
    apiEndpoint: `${API_PATH}/initiatives/${initiativeId}/official_feedback`,
    ...streamParams,
  });
}

export async function deleteOfficialFeedbackFromInitiative(
  initiativeId: string
) {
  const response = await streams.delete(
    `${API_PATH}/official_feedback/${initiativeId}`,
    initiativeId
  );
  queryClient.invalidateQueries(initiativesCountKeys.all());
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/initiatives/${initiativeId}/official_feedback`],
  });
  return response;
}

// ------
