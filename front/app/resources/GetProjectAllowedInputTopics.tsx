// hooks
import useProjectAllowedInputTopics, {
  IProjectAllowedInputTopicsState,
} from 'hooks/useProjectAllowedInputTopics';

interface Props {
  projectId: string;
  children?: Children;
}

type Children = (
  renderProps: IProjectAllowedInputTopicsState
) => JSX.Element | null;

const GetProjectAllowedInputTopics = ({ children, projectId }: Props) => {
  const projectAllowedInputTopics = useProjectAllowedInputTopics(projectId);
  return (children as Children)(projectAllowedInputTopics);
};

export default GetProjectAllowedInputTopics;
