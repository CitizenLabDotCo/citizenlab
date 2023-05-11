import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, IParticipationContextType } from 'typings';
import { capitalizeParticipationContextType } from 'utils/helperUtils';

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

export function pollQuestionsStream(
  participationContextId: string,
  participationContextType: IParticipationContextType
) {
  return streams.get<{ data: IPollQuestion[] }>({
    apiEndpoint: `${API_PATH}/${participationContextType}s/${participationContextId}/poll_questions`,
  });
}

export async function addPollQuestion(
  participationContextId: string,
  participationContextType: IParticipationContextType,
  titleMultiloc: Multiloc
) {
  const response = await streams.add<{ data: IPollQuestion }>(
    `${API_PATH}/poll_questions`,
    {
      participation_context_id: participationContextId,
      participation_context_type: capitalizeParticipationContextType(
        participationContextType
      ),
      title_multiloc: titleMultiloc,
    }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/${participationContextType}s/${participationContextId}/poll_questions`,
    ],
  });
  return response;
}

export function pollQuestionStream(questionId: string) {
  return streams.get<IPollQuestion>({
    apiEndpoint: `${API_PATH}/poll_questions/${questionId}`,
  });
}

export async function deletePollQuestion(
  questionId: string,
  participationContextId?: string,
  participationContextType?: IParticipationContextType
) {
  const response = await streams.delete(
    `${API_PATH}/poll_questions/${questionId}`,
    questionId
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/${participationContextType}s/${participationContextId}/poll_questions`,
    ],
  });
  return response;
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
