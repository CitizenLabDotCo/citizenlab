import useProjectById from 'api/projects/useProjectById';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import { IProjectData } from 'api/projects/types';

export type GetProjectChildProps = IProjectData | undefined;

type children = (renderProps: GetProjectChildProps) => JSX.Element | null;

interface Props {
  projectId?: string | null;
  projectSlug?: string | null;
  children?: children;
}

const GetProject = ({ children, ...props }: Props) => {
  const { data: projectById } = useProjectById(props.projectId);
  const { data: projectBySlug } = useProjectBySlug(props.projectSlug);

  if (!children) return null;
  return children(projectById?.data ?? projectBySlug?.data);
};

export default GetProject;
