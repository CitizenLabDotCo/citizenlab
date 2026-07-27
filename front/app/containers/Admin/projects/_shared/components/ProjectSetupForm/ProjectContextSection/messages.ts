import { defineMessages } from 'react-intl';

export default defineMessages({
  projectContext: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.projectContext',
    defaultMessage: 'Project context',
  },
  spaceLabel: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceLabel',
    defaultMessage: 'Space',
  },
  folderLabel: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderLabel',
    defaultMessage: 'Folder',
  },
  spaceTooltip: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceTooltip',
    defaultMessage:
      'A folder always stays in its own space, so picking a folder also sets the space. Changing the space clears the selected folder.',
  },
  noSpace: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.noSpace',
    defaultMessage: '— No space —',
  },
  noFolder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.noFolder',
    defaultMessage: '— No folder —',
  },
  folderInSpaceOption: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderInSpaceOption',
    defaultMessage: '{folderTitle} ({spaceTitle})',
  },
  spaceOrFolderError: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.spaceOrFolderError',
    defaultMessage: 'Select a space or a folder for this project.',
  },
  folderError: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.folderError2',
    defaultMessage: 'Select a folder for this project.',
  },
  approvalNeededWithSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.approvalNeededWithSpaces',
    defaultMessage:
      'This project will not be in a space or a folder. You will need approval from an admin to publish it.',
  },
  approvalNeededWithoutSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.approvalNeededWithoutSpaces',
    defaultMessage:
      'This project will not be in a folder. You will need approval from an admin to publish it.',
  },
});
