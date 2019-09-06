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

export function pollQuestionsStream(participationContextId: string, participationContextType: 'projects' | 'phases') {
  return streams.get<{ data: IPollQuestion[]}>({ apiEndpoint: `${API_PATH}/${participationContextType}/${participationContextId}/poll_questions` });
}

export async function addPollQuestion(participationContextId: string, participationContextType: 'Project' | 'Phase', titleMultiloc: Multiloc) {
  const response = await streams.add<{data: IPollQuestion}>(`${API_PATH}/poll_questions`, {
    participation_context_id: participationContextId,
    participation_context_type: participationContextType,
    title_multiloc: titleMultiloc
  });
  streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/${participationContextType === 'Phase' ? 'phases' : 'projects'}/${participationContextId}/poll_questions`] });
  return response;
}

export function pollQuestionStream(questionId: string) {
  return streams.get<IPollQuestion>({ apiEndpoint: `${API_PATH}/poll_questions/${questionId}` });
}

export async function deletePollQuestion(questionId: string, participationContextId?: string, participationContextType?: 'projects' | 'phases') {
  const response = await streams.delete(`${API_PATH}/poll_questions/${questionId}`, questionId);
  console.log(`${API_PATH}/${participationContextType}/${participationContextId}/poll_questions`);
  streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/${participationContextType}/${participationContextId}/poll_questions`] });
  return response;
}

export function reorderPollQuestion(questionId: string, newPosition: number) {
  return streams.update(`${API_PATH}/poll_questions/${questionId}/reorder`, questionId, {
    ordering: newPosition
  });
}
export function updatePollQuestion(questionId: string, titleMultiloc: Multiloc) {
  return streams.update<{data: IPollQuestion}>(`${API_PATH}/poll_questions/${questionId}`, questionId, {
    title_multiloc: titleMultiloc
  });
}
