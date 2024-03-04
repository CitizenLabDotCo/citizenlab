import { isNil } from 'utils/helperUtils';

import { Props as InputProps, IProjectData } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

export type GetProjectsChildProps = IProjectData[] | null | undefined;

type children = (renderProps: GetProjectsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetProjects = ({ children, ...props }: Props) => {
  const { data: projects } = useProjects(props);
  if (!children) return null;
  return children(isNil(projects) ? null : projects.data);
};

export default GetProjects;
