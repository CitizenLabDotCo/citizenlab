import { defineMessages } from 'react-intl';

export default defineMessages({
  space: {
    id: 'app.containers.Admin.projects.all.Spaces.Table.space',
    defaultMessage: 'Space',
  },
  spaceManagers: {
    id: 'app.containers.Admin.projects.all.Spaces.Table.spaceManagers',
    defaultMessage: 'Space managers',
  },
  deleteSpaceButton: {
    id: 'app.containers.Admin.projects.all.Spaces.Table.deleteSpaceButton',
    defaultMessage: 'Delete space',
  },
  deleteSpaceModalTitle: {
    id: 'app.containers.Admin.projects.all.Spaces.deleteSpaceModalTitle',
    defaultMessage: 'Delete this space permanently?',
  },
  deleteSpaceModalWarning: {
    id: 'app.containers.Admin.projects.all.Spaces.deleteSpaceModalWarning',
    defaultMessage:
      'This will permanently delete this space. The projects and folders inside of it will not be deleted, but will be moved outside of the space.',
  },
  noSpacesFound: {
    id: 'app.containers.Admin.projects.all.Spaces.Table.noSpacesFound',
    defaultMessage: 'No spaces found',
  },
});
