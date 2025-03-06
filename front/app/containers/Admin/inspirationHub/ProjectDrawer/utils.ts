import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

export const getTenantURL = (
  attributes: ProjectLibraryProjectData['attributes']
) => {
  return `https://${attributes.tenant_host}`;
};

export const getProjectURL = (
  attributes: ProjectLibraryProjectData['attributes']
) => {
  return `${getTenantURL(attributes)}/projects/${attributes.slug}`;
};

export const getPhaseURL = (
  attributes: ProjectLibraryProjectData['attributes'],
  phaseNumber: number
) => {
  return `${getProjectURL(attributes)}/${phaseNumber}`;
};
