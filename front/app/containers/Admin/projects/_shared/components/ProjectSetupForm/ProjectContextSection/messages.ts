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
  folder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folder',
    defaultMessage: 'Folder',
  },
  root: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.root',
    defaultMessage: 'Root level',
  },
  spaceDescription: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceDescription',
    defaultMessage: 'The project will be inside of a space.',
  },
  folderDescription: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderDescription',
    defaultMessage: 'The project will be inside of a folder.',
  },
  rootDescriptionWithSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescriptionWithSpaces',
    defaultMessage: 'The project will not be in a folder or space.',
  },
  rootDescriptionWithoutSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescriptionWithoutSpaces',
    defaultMessage: 'The project will not be in a folder.',
  },
  rootDescriptionCreateWithSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescriptionCreateWithSpaces',
    defaultMessage:
      'The project will not be in a folder or space. If you choose this option, you will need approval from an admin to publish this project.',
  },
  rootDescriptionCreateWithoutSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.rootDescriptionCreateWithoutSpaces',
    defaultMessage:
      'The project will not be in a folder. If you choose this option, you will need approval from an admin to publish this project.',
  },
  spaceError: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceError',
    defaultMessage: 'Please select a space.',
  },
  folderError: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderError',
    defaultMessage: 'Please select a folder.',
  },
});
