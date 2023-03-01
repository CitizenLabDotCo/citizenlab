import { IIdeaStatusData } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';

interface InputProps {}

type children = (renderProps: GetIdeaStatusesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetIdeaStatusesChildProps = IIdeaStatusData[] | undefined | null;

const GetIdeaStatuses = ({ children }: Props) => {
  const { data: ideaStatuses } = useIdeaStatuses();
  return (children as children)(ideaStatuses?.data);
};

export default GetIdeaStatuses;
