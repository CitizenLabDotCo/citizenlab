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
  spaceDescriptionChangeLater: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceDescription',
    defaultMessage:
      'The project will be created within a space. You can change this later.',
  },
  folder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folder',
    defaultMessage: 'Folder',
  },
  folderDescriptionChangeLater: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderDescriptionChangeLater',
    defaultMessage:
      'The project will be created within a folder. You can change this later.',
  },
  folderDescriptioChangeLaterExceptRoot: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderDescriptioChangeLaterExceptRoot',
    defaultMessage:
      'The project will be created within a folder. You can change the folder later, but you cannot move the project to root later.',
  },
  root: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.root',
    defaultMessage: 'Root',
  },
  rootDescriptionChangeLater: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescription',
    defaultMessage:
      'Project will not be in any folder or space. You can change this later.',
  },
  rootDescriptionPMsAndFMs: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescriptionPMsAndFMs',
    defaultMessage:
      'Project will not be in any folder or space. If you choose this, you will need approval to publish the project.',
  },
});
