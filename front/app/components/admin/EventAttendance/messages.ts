import { defineMessages } from 'react-intl';

export default defineMessages({
  eventAttendanceExportText: {
    id: 'app.containers.AdminPage.ProjectEvents.eventAttendanceExport1',
    defaultMessage:
      'To email registrants directly from the platform, admins must create a user group in the {userTabLink} tab. {supportArticleLink}.',
  },
  usersTabLink: {
    id: 'app.containers.AdminPage.ProjectEvents.usersTabLink',
    defaultMessage: '/admin/users',
  },
  usersTabLinkText: {
    id: 'app.containers.AdminPage.ProjectEvents.usersTabLinkText',
    defaultMessage: 'Users',
  },
  attendanceSupportArticleLinkText: {
    id: 'app.containers.AdminPage.ProjectEvents.attendanceSupportArticleLinkText',
    defaultMessage: 'See the support article',
  },
  attendanceSupportArticleLink2: {
    id: 'app.containers.AdminPage.ProjectEvents.attendanceSupportArticleLink2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527627-adding-events-to-your-platform',
  },
});
