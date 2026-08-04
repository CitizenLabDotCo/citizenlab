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
  cannotMoveOutOfSpaceOrFolder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.cannotMoveOutOfSpaceOrFolder',
    defaultMessage:
      "You don't have permission to move this project out of its space or folder. An admin can do this for you.",
  },
  cannotMoveOutOfFolder: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.cannotMoveOutOfFolder',
    defaultMessage:
      "You don't have permission to move this project out of its folder. An admin can do this for you.",
  },
  approvalNeededWithSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.approvalNeededWithSpaces2',
    defaultMessage:
      'This project is not in a space or a folder. You will need approval from an admin to publish it.',
  },
  approvalNeededWithoutSpaces: {
    id: 'app.containers.Admin.projects._shared.components.ProjectSetupForm.ProjectContextSection.approvalNeededWithoutSpaces2',
    defaultMessage:
      'This project is not in a folder. You will need approval from an admin to publish it.',
  },
});
