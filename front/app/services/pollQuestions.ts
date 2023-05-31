import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export function reorderPollQuestion(questionId: string, newPosition: number) {
  return streams.update(
    `${API_PATH}/poll_questions/${questionId}/reorder`,
    questionId,
    {
      ordering: newPosition,
    }
  );
}
