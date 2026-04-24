import { defineMessages } from 'react-intl';

export default defineMessages({
  projectContext: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.projectContext',
    defaultMessage: 'Project context',
  },
  space: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.space',
    defaultMessage: 'Space',
  },
  spaceDescription: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceDescription',
    defaultMessage: 'The project will be created within a space.',
  },
  folder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folder',
    defaultMessage: 'Folder',
  },
  folderDescription: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderDescription',
    defaultMessage: 'The project will be created within a folder.',
  },
  root: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.root',
    defaultMessage: 'Root',
  },
  rootDescription: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescription',
    defaultMessage: 'Project will not be in any folder or space.',
  },
});
