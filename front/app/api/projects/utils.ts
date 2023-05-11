import { IProjectData } from './types';

export function getProjectUrl(project: IProjectData) {
  return `/projects/${project.attributes.slug}`;
}

export function getProjectInputTerm(project: IProjectData) {
  return project.attributes.input_term;
}
