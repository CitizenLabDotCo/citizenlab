import { TreeView } from 'api/spaces/types';
import { IUserData } from 'api/users/types';

export const getLists = (user: IUserData, treeView: TreeView) => {
  const folderIds = user.attributes.roles
    ?.filter(
      (
        role
      ): role is Extract<typeof role, { type: 'project_folder_moderator' }> =>
        role.type === 'project_folder_moderator'
    )
    .map((role) => role.project_folder_id);

  const projectIds = user.attributes.roles
    ?.filter(
      (role): role is Extract<typeof role, { type: 'project_moderator' }> =>
        role.type === 'project_moderator'
    )
    .map((role) => role.project_id);

  const foldersSet = new Set(folderIds);
  const projectsSet = new Set(projectIds);

  const { nodes } = treeView.data.attributes;

  const folders = nodes.filter((node) => node.type === 'folder');
  const foldersUserModerates = folders.filter((node) =>
    foldersSet.has(node.id)
  );

  const topLevelProjectsUserModerates = nodes.filter(
    (node) => node.type === 'project' && projectsSet.has(node.id)
  );
  const nestedProjectsUserModerates = folders
    .flatMap((folder) => folder.children)
    .filter((child) => projectsSet.has(child.id));

  const projectsUserModerates = [
    ...topLevelProjectsUserModerates,
    ...nestedProjectsUserModerates,
  ];

  return {
    projectsUserModerates,
    foldersUserModerates,
  };
};
