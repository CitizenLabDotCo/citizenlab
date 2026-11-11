import { defineMessages } from 'react-intl';

export default defineMessages({
  whoCanFindThisProject: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.whoCanFindThisProject',
    defaultMessage: 'Who can find this project?',
  },
  selectHowDiscoverableProjectIs: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.selectHowDiscoverableProjectIs',
    defaultMessage: 'Select how discoverable this project is.',
  },
  listed: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.listd',
    defaultMessage: 'Listed',
  },
  unlisted: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.unlisted',
    defaultMessage: 'Unlisted',
  },
  thisProjectIsVisibleToEveryone: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.thisProjectIsVisibleToEveryone',
    defaultMessage:
      'This project is visible to everyone who has access, and will appear on the homepage and in the widgets.',
  },
  thisProjectWillBeHidden: {
    id: 'app.containers.Admin.projects.project.general.components.UnlistedInput.thisProjectWillBeHidden',
    defaultMessage:
      'This project will be hidden from the wider public, and will only be visible to those who have the link.',
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
  participationLocationTitle: {
    id: 'app.containers.Admin.projects.project.general.components.ParticipationLocationToggle.participationLocationTitle',
    defaultMessage: 'Participant location',
  },
  participationLocationLabel: {
    id: 'app.containers.Admin.projects.project.general.components.ParticipationLocationToggle.participationLocationLabel',
    defaultMessage:
      'Record the approximate location (city, region and country) of participants when they take part in this project. IP addresses are not stored.',
  },
  participationDeviceTitle: {
    id: 'app.containers.Admin.projects.project.general.components.ParticipationDeviceToggle.participationDeviceTitle',
    defaultMessage: 'Participant device',
  },
  participationDeviceLabel: {
    id: 'app.containers.Admin.projects.project.general.components.ParticipationDeviceToggle.participationDeviceLabel',
    defaultMessage:
      'Record the device, browser and operating system participants use when they take part in this project, with a device ID that is the same for one device within the project. This helps spot one person taking part several times. IP addresses are not stored.',
  },
});
