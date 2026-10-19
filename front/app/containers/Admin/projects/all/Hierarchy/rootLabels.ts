import allMessages from '../messages';

import messages from './messages';

// Admins see everything, so their groups are just "Spaces", "Folders" and
// "Projects". Everyone else sees what they manage: "Your …", and the projects
// left once their spaces and folders are counted are "Other projects you
// manage".
export const getRootLabels = ({
  seesAll,
  hasContainers,
}: {
  seesAll: boolean;
  hasContainers: boolean;
}) => {
  if (seesAll) {
    return {
      spaces: allMessages.spaces,
      folders: allMessages.folders,
      projects: allMessages.projects,
    };
  }

  return {
    spaces: messages.yourSpaces,
    folders: messages.yourFolders,
    projects: hasContainers
      ? messages.otherProjectsYouManage
      : messages.yourProjects,
  };
};
