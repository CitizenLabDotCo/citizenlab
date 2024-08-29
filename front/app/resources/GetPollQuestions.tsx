import { IPollQuestionData } from 'api/poll_questions/types';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

type children = (renderProps: GetPollQuestionsChildProps) => JSX.Element | null;

interface Props {
  phaseId: string;
  children?: children;
}

export type GetPollQuestionsChildProps = IPollQuestionData[] | undefined;

const GetPollQuestions = ({ phaseId, children }: Props) => {
  const { data: pollQuestions } = usePollQuestions({
    phaseId,
  });

  return (children as children)(pollQuestions?.data);
};

export default GetPollQuestions;
