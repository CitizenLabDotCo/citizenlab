import { defineMessages } from 'react-intl';

export default defineMessages({
  lockedProject: {
    id: 'app.containers.Admin.spaces.EditSpace.TreeView.lockedProject',
    defaultMessage:
      'The folder that this project is in, has been added to this space. Therefore, the project is automatically in the space too. To remove this project from this space, you will need to remove the folder.',
  },
  crossedOutFolder: {
    id: 'app.containers.Admin.spaces.EditSpace.TreeView.crossedOutFolder',
    defaultMessage:
      'This folder is not in the space. However, some projects inside of it are. These projects are shown below.',
  },
  removeFromSpace: {
    id: 'app.containers.Admin.spaces.EditSpace.TreeView.removeFromSpace',
    defaultMessage: 'Remove from space',
  },
});
