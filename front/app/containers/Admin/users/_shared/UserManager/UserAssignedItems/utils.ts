import { TreeView } from 'api/spaces/types';
import { IUserData } from 'api/users/types';

export const getLists = (user: IUserData, treeView: TreeView) => {
  const projectIds = user.attributes.roles
    ?.filter(
      (role): role is Extract<typeof role, { type: 'project_moderator' }> =>
        role.type === 'project_moderator'
    )
    .map((role) => role.project_id);

  const folderIds = user.attributes.roles
    ?.filter(
      (
        role
      ): role is Extract<typeof role, { type: 'project_folder_moderator' }> =>
        role.type === 'project_folder_moderator'
    )
    .map((role) => role.project_folder_id);

  const projectsSet = new Set(projectIds);
  const foldersSet = new Set(folderIds);

  const { nodes } = treeView.data.attributes;

  const foldersUserModerates = nodes.filter(
    (node) => node.type === 'folder' && foldersSet.has(node.id)
  );
  const projectsUserModerates = nodes.filter(
    (node) => node.type === 'project' && projectsSet.has(node.id)
  );

  return {
    projectsUserModerates,
    foldersUserModerates,
  };
};
