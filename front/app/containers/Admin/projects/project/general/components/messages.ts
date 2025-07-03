import { defineMessages } from 'react-intl';

export default defineMessages({
  thisProjectWillBeListed: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.thisProjectWillBeListed',
    defaultMessage:
      'This project will be listed normally on the homepage and widgets.',
  },
  thisProjectWillStayHidden: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.thisProjectWillStayHidden',
    defaultMessage:
      'This project will stay hidden from the wider public unless you share the link.',
  },
  notVisible: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.notVisible',
    defaultMessage: 'Not visible on the homepage or widgets',
  },
  notIndexed: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.notIndexed',
    defaultMessage: 'Not indexed by search engines',
  },
  emailNotifications: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.emailNotifications',
    defaultMessage: 'Email notifications only sent to participants',
  },
  onlyAccessible: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.onlyAccessible',
    defaultMessage: 'Only accessible via direct URL',
  },
});
