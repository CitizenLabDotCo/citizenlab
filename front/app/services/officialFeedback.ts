import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

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

export function updateOfficialFeedback(
  officialFeedbackId: string,
  object: INewFeedback
) {
  return streams.update<IOfficialFeedback>(
    `${API_PATH}/official_feedback/${officialFeedbackId}`,
    officialFeedbackId,
    { official_feedback: object }
  );
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

export async function addOfficialFeedbackToIdea(
  ideaId: string,
  feedBack: INewFeedback
) {
  const response = await streams.add<IOfficialFeedback>(
    `${API_PATH}/ideas/${ideaId}/official_feedback`,
    { official_feedback: feedBack }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/stats/ideas_count`],
  });
  return response;
}

export async function deleteOfficialFeedbackFromIdea(ideaId: string) {
  const response = await streams.delete(
    `${API_PATH}/official_feedback/${ideaId}`,
    ideaId
  );
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/ideas/${ideaId}/official_feedback`,
      `${API_PATH}/stats/ideas_count`,
    ],
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

export async function addOfficialFeedbackToInitiative(
  initiativeId: string,
  feedBack: INewFeedback
) {
  const response = await streams.add<IOfficialFeedback>(
    `${API_PATH}/initiatives/${initiativeId}/official_feedback`,
    { official_feedback: feedBack }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/stats/initiatives_count`],
  });
  return response;
}

export async function deleteOfficialFeedbackFromInitiative(
  initiativeId: string
) {
  const response = await streams.delete(
    `${API_PATH}/official_feedback/${initiativeId}`,
    initiativeId
  );
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/initiatives/${initiativeId}/official_feedback`,
      `${API_PATH}/stats/initiatives_count`,
    ],
  });
  return response;
}

// ------
