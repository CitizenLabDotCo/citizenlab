import { getModeratedItems } from 'api/admin_publications/getModeratedItems';
import {
  FolderNode,
  ProjectNode,
  TreeView,
} from 'api/admin_publications/types';
import { IUser } from 'api/users/types';

import { isAdmin } from 'utils/permissions/roles';

/**
 * Returns the projects and folders the given user can add to a space, derived
 * from the admin_publications tree view: items that are not already in a space
 * and that the user is allowed to manage.
 *
 * Admins can manage everything; moderators only the items they moderate. Folder
 * moderators can also pull the projects inside their folders out into a space,
 * so those nested projects are included too. This mirrors what the backend
 * authorizes, so the UI never offers something that would 401.
 */
export const getAddableNodes = (
  user: IUser,
  treeView: TreeView
): (ProjectNode | FolderNode)[] => {
  const { projectsUserModerates, foldersUserModerates } = getModeratedItems(
    user.data,
    treeView
  );
  const userIsAdmin = isAdmin(user);
  const moderatedFolderIds = new Set(foldersUserModerates.map((f) => f.id));
  const moderatedProjectIds = new Set(projectsUserModerates.map((p) => p.id));

  const rootNodes = treeView.data.attributes.nodes;
  const rootFolders = rootNodes.filter(
    (node): node is FolderNode => node.type === 'folder'
  );

  // Root-level folders the user can manage.
  const addableFolders = rootFolders.filter(
    (folder) => userIsAdmin || moderatedFolderIds.has(folder.id)
  );

  // Root-level projects, plus projects sitting inside a root-level folder — the
  // latter can be pulled out of their folder and into the space. A project is
  // manageable when the user moderates it directly or moderates its folder.
  const addableRootProjects = rootNodes.filter(
    (node): node is ProjectNode =>
      node.type === 'project' &&
      (userIsAdmin || moderatedProjectIds.has(node.id))
  );
  const addableProjectsInFolders = rootFolders.flatMap((folder) => {
    const canManageFolder = userIsAdmin || moderatedFolderIds.has(folder.id);
    return folder.children.filter(
      (project) => canManageFolder || moderatedProjectIds.has(project.id)
    );
  });

  return [
    ...addableFolders,
    ...addableRootProjects,
    ...addableProjectsInFolders,
  ];
};
