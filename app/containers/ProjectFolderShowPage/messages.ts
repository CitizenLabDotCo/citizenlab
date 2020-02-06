import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.containers.ProjectFolderShowPage.twitterMessage',
    defaultMessage: '{title}: Share your ideas on',
  },
  metaTitle: {
    id: 'app.containers.ProjectFolderShowPage.metaTitle',
    defaultMessage: 'Project: {projectTitle}',
  },
  invisibleTitleMainContent: {
    id: 'app.containers.ProjectFolderShowPage.invisibleTitleMainContent',
    defaultMessage: 'Information about this project',
  },
  noProjectFoundHere: {
    id: 'app.containers.ProjectFolderShowPage.noProjectFoundHere',
    defaultMessage: '{tenantName, select, CQC {Log in to view this project.} other {There is no project here.}}',
  },
  goBackToList: {
    id: 'app.containers.ProjectFolderShowPage.goBackToList',
    defaultMessage: 'Go back to the list',
  },
});

// TODO: perhaps change messages to include folder
