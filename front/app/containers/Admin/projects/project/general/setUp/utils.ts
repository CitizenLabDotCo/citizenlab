import { IProject, IUpdatedProjectProperties } from 'api/projects/types';

export const getProjectAttributes = (
  project: IProject,
  projectAttributesDiff: IUpdatedProjectProperties
) => {
  const { attributes } = project.data;

  const projectAttrs = {
    ...attributes,
    ...projectAttributesDiff,
  };

  if (projectAttrs.folder_id) {
    delete projectAttrs.space_id;
  }

  if (projectAttrs.space_id) {
    delete projectAttrs.folder_id;
  }

  return projectAttrs;
};
