import { ITopicData } from 'services/topics';
import useProjectTopics, { Parameters as HookProps } from 'hooks/useProjectTopics';

export type GetProjectTopicsChildProps = ITopicData[] | undefined | null | Error;

type children = (renderProps: GetProjectTopicsChildProps) => JSX.Element | null;

interface Props extends HookProps {
  children?: children;
}

export default (props: Props) => {
  const projectTopics = useProjectTopics({ ...props });
  return (props.children as children)(projectTopics);
};
