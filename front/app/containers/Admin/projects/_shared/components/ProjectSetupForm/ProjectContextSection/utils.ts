import { ProjectContext } from './types';

interface Params {
  folder_id?: string | null;
  space_id?: string | null;
}

export const validateProjectContext = (
  projectContext: ProjectContext,
  { folder_id, space_id }: Params
) => {
  if (projectContext === 'root') {
    return !folder_id && !space_id;
  }

  if (projectContext === 'folder') {
    // In this case, a folder_id is possibly present,
    // depending on if the folder is also in a space.
    return !!folder_id;
  }

  return !!space_id && !folder_id;
};
