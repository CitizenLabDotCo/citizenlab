import { RouteType } from 'routes';

import { IProjectData } from './types';

export function getProjectUrl(project: IProjectData): RouteType {
  return `/projects/${project.attributes.slug}`;
}
