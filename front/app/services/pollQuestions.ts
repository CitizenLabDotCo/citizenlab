import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, IParticipationContextType } from 'typings';

interface IPollQuestionAttributes {
  question_type: 'multiple_options' | 'single_option';
  max_options: number | null;
  title_multiloc: Multiloc;
  ordering: number;
}

export interface IPollQuestion {
  id: string;
  type: 'question';
  attributes: IPollQuestionAttributes;
  relationships: {
    options: {
      data: {
        id: string;
        type: 'option';
      }[];
    };
    participation_context: {
      data: {
        id: string;
        type: IParticipationContextType;
      };
    };
  };
}

export function reorderPollQuestion(questionId: string, newPosition: number) {
  return streams.update(
    `${API_PATH}/poll_questions/${questionId}/reorder`,
    questionId,
    {
      ordering: newPosition,
    }
  );
}
export function updatePollQuestion(
  questionId: string,
  diff: Partial<IPollQuestionAttributes>
) {
  return streams.update<{ data: IPollQuestion }>(
    `${API_PATH}/poll_questions/${questionId}`,
    questionId,
    diff
  );
}
