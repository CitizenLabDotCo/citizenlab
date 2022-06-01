function adminProjectsFolderPathPrefix(projectFolderId: string) {
  return `/admin/projects/folders/${projectFolderId}`;
}

export function adminProjectFoldersIndexPath(projectFolderId: string) {
  return `${adminProjectsFolderPathPrefix(projectFolderId)}/projects`;
}

export function adminProjectFoldersSettingsPath(projectFolderId: string) {
  return `${adminProjectsFolderPathPrefix(projectFolderId)}/settings`;
}

export function adminProjectFoldersPermissionsPath(projectFolderId: string) {
  return `${adminProjectsFolderPathPrefix(projectFolderId)}/permissions`;
}
