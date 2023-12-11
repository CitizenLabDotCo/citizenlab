import { IProjectData } from './types';

export function getProjectUrl(project: IProjectData) {
  return `/projects/${project.attributes.slug}`;
}
