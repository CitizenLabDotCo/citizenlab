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

// ------
