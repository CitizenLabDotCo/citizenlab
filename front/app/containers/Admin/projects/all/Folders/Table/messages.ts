import { defineMessages } from 'react-intl';

export default defineMessages({
  folder: {
    id: 'app.containers.Admin.projects.all.new.Folders.Table.folder',
    defaultMessage: 'Folder',
  },
  status: {
    id: 'app.containers.Admin.projects.all.new.Folders.Table.status',
    defaultMessage: 'Status',
  },
  numberOfProjects: {
    id: 'app.containers.Admin.projects.all.new.Folders.Table.numberOfProjects',
    defaultMessage:
      '{numberOfProjects, plural, one {# project} other {# projects}}',
  },
  allFoldersHaveLoaded: {
    id: 'app.containers.Admin.projects.all.new.Folders.Table.allFoldersHaveLoaded',
    defaultMessage: 'All folders have been loaded',
  },
  noFoldersFound: {
    id: 'app.containers.Admin.projects.all.new.Folders.Table.noFoldersFound',
    defaultMessage: 'No folders found',
  },
});
