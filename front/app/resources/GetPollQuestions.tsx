import { IPollQuestionData } from 'api/poll_questions/types';
import { IParticipationContextType } from 'typings';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

type children = (renderProps: GetPollQuestionsChildProps) => JSX.Element | null;

interface Props {
  participationContextId: string;
  participationContextType: IParticipationContextType;
  children?: children;
}

export type GetPollQuestionsChildProps = IPollQuestionData[] | undefined;

const GetPollQuestions = ({
  participationContextId,
  participationContextType,
  children,
}: Props) => {
  const { data: pollQuestions } = usePollQuestions({
    participationContextId,
    participationContextType,
  });

  return (children as children)(pollQuestions?.data);
};

export default GetPollQuestions;
