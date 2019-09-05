import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IPollQuestion {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    ordering: number;
  };
}

type TParticipationContext = 'Project' | 'Phase';

export function pollQuestionsStream(participationContextId: string, participationContextType: TParticipationContext) {
  return streams.get<IPollQuestion[]>({ apiEndpoint: `${API_PATH}/${participationContextType}s/${participationContextId}` });
}

export function addPollQuestion(participationContextId: string, participationContextType: TParticipationContext, titleMultiloc: Multiloc) {
  return streams.add<IPollQuestion>(`${API_PATH}/poll_questions`, {
    participation_context_id: participationContextId,
    participation_context_type: participationContextType,
    title_multiloc: titleMultiloc
  });
}

export function pollQuestionStream(questionId: string) {
  return streams.get<IPollQuestion>({ apiEndpoint: `${API_PATH}/poll_questions/${questionId}` });
}

export function deletePollQuestion(questionId: string) {
  return streams.delete(`${API_PATH}/poll_questions/${questionId}`, questionId);
}

export function reorderPollQuestion(questionId: string, newPosition: number) {
  return streams.update(`${API_PATH}/poll_questions/${questionId}/reorder`, questionId, {
    ordering: newPosition
  });
}
export function updatePollQuestion(questionId: string, titleMultiloc: Multiloc) {
  return streams.update(`${API_PATH}/poll_questions/${questionId}`, questionId, {
    title_multiloc: titleMultiloc
  });
}
