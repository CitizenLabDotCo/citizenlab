import { format } from 'date-fns';

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

export const formatDate = (date?: Date) => {
  if (!date) return;
  return format(date, 'dd MMMM yyyy');
};
