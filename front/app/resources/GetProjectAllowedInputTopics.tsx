// hooks
import { IProjectAllowedInputTopicData } from 'api/project_allowed_input_topics/types';
import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';

interface Props {
  projectId: string;
  children?: Children;
}

type Children = (
  renderProps: IProjectAllowedInputTopicData[] | undefined
) => JSX.Element | null;

const GetProjectAllowedInputTopics = ({ children, projectId }: Props) => {
  const { data: projectAllowedInputTopics } = useProjectAllowedInputTopics({
    projectId,
  });
  return (children as Children)(projectAllowedInputTopics?.data);
};

export default GetProjectAllowedInputTopics;
