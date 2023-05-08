import useProjects from 'hooks/useProjects';
import { IProjectData, PublicationStatus } from 'services/projects';
import { isError } from 'utils/helperUtils';

export type Sort =
  | 'new'
  | '-new'
  | 'trending'
  | '-trending'
  | 'popular'
  | '-popular';

export type SelectedPublicationStatus = 'all' | 'published' | 'archived';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  areas?: string[];
  publicationStatuses: PublicationStatus[];
  filterCanModerate?: boolean;
  filteredProjectIds?: string[];
}

export type GetProjectsChildProps = {
  projectsList: IProjectData[] | null | undefined;
};

type children = (renderProps: GetProjectsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

const GetProjects = ({
  pageNumber,
  pageSize,
  sort,
  areas,
  publicationStatuses,
  filterCanModerate,
  filteredProjectIds,
  children,
}: Props) => {
  const projectsList = useProjects({
    pageNumber,
    pageSize,
    sort,
    areas,
    publicationStatuses,
    canModerate: filterCanModerate,
    projectIds: filteredProjectIds,
  });

  return (children as any)({
    projectsList: isError(projectsList) ? null : projectsList,
  });
};

export default GetProjects;
