import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.containers.ProjectFolderShowPage.twitterMessage',
    defaultMessage: '{title}: Share your ideas on ??',
  },
  metaTitle: {
    id: 'app.containers.ProjectFolderShowPage.metaTitle',
    defaultMessage: '????: {title}',
  },
  invisibleTitleMainContent: {
    id: 'app.containers.ProjectFolderShowPage.invisibleTitleMainContent',
    defaultMessage: 'Information about this ???',
  },
  noProjectFoundHere: {
    id: 'app.containers.ProjectFolderShowPage.noProjectFoundHere',
    defaultMessage: '{tenantName, select, CQC {Log in to view this ????.} other {There is no ??? here.}}',
  },
  goBackToList: {
    id: 'app.containers.ProjectFolderShowPage.goBackToList',
    defaultMessage: 'Go back to the list',
  },
});

// TODO: perhaps change messages to include folder
