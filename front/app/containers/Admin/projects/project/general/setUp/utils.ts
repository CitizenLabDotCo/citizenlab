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

  // This is necessary to make validation pass.
  // In the BE, a project in folder in a space will also have
  // a space_id.
  // But in the frontend interface, we do not see it like this:
  // either you are in a space, or in a folder, and if your folder
  // is in a space it is still just in the folder and not in the space.
  if (attributes.space_id && attributes.folder_id) {
    projectAttrs.space_id = null;
  }

  return projectAttrs;
};
