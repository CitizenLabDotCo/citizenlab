import {
  FolderNode,
  ProjectNode,
  SpaceNode,
  TreeView,
} from 'api/admin_publications/types';
import { IUserData } from 'api/users/types';

export const getModeratedItems = (user: IUserData, treeView: TreeView) => {
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

  const spaceIds = user.attributes.roles
    ?.filter(
      (role): role is Extract<typeof role, { type: 'space_moderator' }> =>
        role.type === 'space_moderator'
    )
    .map((role) => role.space_id);

  const foldersSet = new Set(folderIds);
  const projectsSet = new Set(projectIds);
  const spacesSet = new Set(spaceIds);

  const { nodes } = treeView.data.attributes;

  // Collect all spaces, folders, and projects
  const spaces = nodes.filter(
    (node): node is SpaceNode => node.type === 'space'
  );

  const rootFolders = nodes.filter(
    (node): node is FolderNode => node.type === 'folder'
  );

  // Get folders from spaces
  const foldersInSpaces = spaces.flatMap((space) =>
    space.children.filter(
      (child): child is FolderNode => child.type === 'folder'
    )
  );

  const allFolders = [...rootFolders, ...foldersInSpaces];

  // Find spaces user moderates
  const spacesUserModerates = spaces.filter((node) => spacesSet.has(node.id));

  // Find folders user moderates
  const foldersUserModerates = allFolders.filter((node) =>
    foldersSet.has(node.id)
  );

  // Find projects user moderates
  // 1. Root-level projects
  const rootProjectsUserModerates = nodes.filter(
    (node): node is ProjectNode =>
      node.type === 'project' && projectsSet.has(node.id)
  );

  // 2. Projects inside root-level folders
  const projectsInRootFoldersUserModerates = rootFolders
    .flatMap((folder) => folder.children)
    .filter((child) => projectsSet.has(child.id));

  // 3. Projects inside spaces (not in folders)
  const projectsInSpacesUserModerates = spaces
    .flatMap((space) =>
      space.children.filter(
        (child): child is ProjectNode => child.type === 'project'
      )
    )
    .filter((project) => projectsSet.has(project.id));

  // 4. Projects inside folders that are in spaces
  const projectsInSpaceFoldersUserModerates = foldersInSpaces
    .flatMap((folder) => folder.children)
    .filter((child) => projectsSet.has(child.id));

  const projectsUserModerates = [
    ...rootProjectsUserModerates,
    ...projectsInRootFoldersUserModerates,
    ...projectsInSpacesUserModerates,
    ...projectsInSpaceFoldersUserModerates,
  ];

  return {
    projectsUserModerates,
    foldersUserModerates,
    spacesUserModerates,
  };
};
