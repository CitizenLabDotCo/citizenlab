import { defineMessages } from 'react-intl';

export default defineMessages({
  moderatorsSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorsSectionTitle',
    defaultMessage: 'Who can moderate this project?',
  },
  projectManagerTooltipContent: {
    id: 'app.containers.AdminPage.ProjectEdit.projectManagerTooltipContent',
    defaultMessage:
      'Project managers can edit projects, manage inputs and email participants. You can {moderationInfoCenterLink} to find more information about the rights assigned to project managers.',
  },
  moderationInfoCenterLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationInfoCenterLinkText',
    defaultMessage: 'visit our Help Center',
  },
  moreInfoModeratorLink: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLink',
    defaultMessage:
      'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
});
