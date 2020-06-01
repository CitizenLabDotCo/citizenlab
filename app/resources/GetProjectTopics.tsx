import { ITopicData } from 'services/topics';
import useProjectTopics, { Parameters as HookProps } from 'hooks/useProjectTopics';

export type GetProjectTopicsChildProps = ITopicData[] | undefined | null | Error;

type children = (renderProps: GetProjectTopicsChildProps) => JSX.Element | null;

interface Props extends HookProps {
  children?: children;
}

export default ({ projectId, ...props }: Props) => {
  const projectTopics = useProjectTopics({ projectId });
  return (props.children as children)(projectTopics);
};
