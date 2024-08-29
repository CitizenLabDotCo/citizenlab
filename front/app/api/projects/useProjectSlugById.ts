import { RouteType } from 'routes';

import useProjects from 'api/projects/useProjects';

export type TProjectSlugById = Record<string, RouteType>;

export default function useProjectSlugById() {
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'archived', 'draft'],
  });
  const projectSlugById = projects?.data.reduce((acc, project) => {
    acc[project.id] = `/projects/${project.attributes.slug}`;
    return acc;
  }, {} as TProjectSlugById);

  return projectSlugById;
}
