import useProject, { Props as InputProps } from 'hooks/useProject';
import { IProjectData } from 'services/projects';

export type GetProjectChildProps = IProjectData | undefined | null | Error;

type children = (renderProps: GetProjectChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetProject = ({ children, ...props }: Props) => {
  const project = useProject(props);
  if (!children) return null;
  return children(project);
};

export default GetProject;
