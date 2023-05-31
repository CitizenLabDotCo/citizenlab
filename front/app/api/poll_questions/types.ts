import { Keys } from 'utils/cl-react-query/types';
import pollQuestionsKeys from './keys';
import { IParticipationContextType, Multiloc } from 'typings';

export type PollQuestionsKeys = Keys<typeof pollQuestionsKeys>;

interface IPollQuestionAttributes {
  question_type: 'multiple_options' | 'single_option';
  max_options: number | null;
  title_multiloc: Multiloc;
  ordering: number;
}

export interface IPollQuestionData {
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

export type IPollQuestion = {
  data: IPollQuestionData;
};

export type IPollQuestions = {
  data: IPollQuestionData[];
};

export type IPollQuestionParameters = {
  participationContextId: string;
  participationContextType: IParticipationContextType;
};
