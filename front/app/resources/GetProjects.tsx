import useProjects, { Props as InputProps } from 'hooks/useProjects';
import { IProjectData } from 'services/projects';
import { isError } from 'utils/helperUtils';

export type Sort =
  | 'new'
  | '-new'
  | 'trending'
  | '-trending'
  | 'popular'
  | '-popular';

export type SelectedPublicationStatus = 'all' | 'published' | 'archived';

export type GetProjectsChildProps = IProjectData[] | null | undefined;

type children = (renderProps: GetProjectsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetProjects = ({ children, ...props }: Props) => {
  const projects = useProjects(props);
  return (children as any)(isError(projects) ? null : projects);
};

export default GetProjects;
