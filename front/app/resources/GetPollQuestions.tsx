import { IPollQuestion } from 'services/pollQuestions';
import { CLErrors, IParticipationContextType } from 'typings';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

type children = (renderProps: GetPollQuestionsChildProps) => JSX.Element | null;

interface Props {
  participationContextId: string;
  participationContextType: IParticipationContextType;
  children?: children;
}

export type GetPollQuestionsChildProps =
  | IPollQuestion[]
  | undefined
  | null
  | CLErrors;

const GetPollQuestions = ({
  participationContextId,
  participationContextType,
  children,
}: Props) => {
  const { data: pollQuestions, error } = usePollQuestions({
    participationContextId,
    participationContextType,
  });

  return (children as children)(pollQuestions?.data || error);
};

export default GetPollQuestions;
