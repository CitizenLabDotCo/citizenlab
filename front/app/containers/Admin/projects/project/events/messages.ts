import { defineMessages } from 'react-intl';

export default defineMessages({
  addEventButton: {
    id: 'app.containers.AdminPage.ProjectEvents.addEventButton',
    defaultMessage: 'Add an event',
  },
  titleColumnHeader: {
    id: 'app.containers.AdminPage.ProjectEvents.titleColumnHeader',
    defaultMessage: 'Title & dates',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.editButtonLabel',
    defaultMessage: 'Edit',
  },
  deleteConfirmationModal: {
    id: 'app.containers.AdminPage.ProjectEvents.deleteConfirmationModal',
    defaultMessage:
      'Are you sure you want to delete this event? There is no way to undo this!',
  },
  editEventTitle: {
    id: 'app.containers.AdminPage.ProjectEvents.editEventTitle',
    defaultMessage: 'Edit Event',
  },
  newEventTitle: {
    id: 'app.containers.AdminPage.ProjectEvents.newEventTitle',
    defaultMessage: 'New Event',
  },
  titleLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.titleLabel',
    defaultMessage: 'Title',
  },
  onlineEventLinkLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.onlineEventLinkLabel',
    defaultMessage: 'Online event link',
  },
  onlineEventLinkTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.onlineEventLinkTooltip',
    defaultMessage: 'If your event is online, add a link to it here.',
  },
  locationLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.locationLabel',
    defaultMessage: 'Location',
  },
  dateStartLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.dateStartLabel',
    defaultMessage: 'Starting date & time',
  },
  datesEndLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.datesEndLabel',
    defaultMessage: 'End date & time',
  },
  descriptionLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.descriptionLabel',
    defaultMessage: 'Description',
  },
  saveButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.saveButtonLabel',
    defaultMessage: 'Save',
  },
  saveSuccessLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.saveSuccessLabel',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.ProjectEvents.saveErrorMessage',
    defaultMessage: 'We could not save your changes, please try again.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.ProjectEvents.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  fileUploadLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.fileUploadLabel',
    defaultMessage: 'Add files to this event',
  },
  fileUploadLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the event card directly.',
  },
  titleEvents: {
    id: 'app.containers.AdminPage.ProjectEvents.titleEvents',
    defaultMessage: 'Manage events',
  },
  subtitleEvents: {
    id: 'app.containers.AdminPage.ProjectEvents.subtitleEvents',
    defaultMessage:
      'Add offline events or meetings that are linked to your project here. Upcoming and past events are always shown immediately under your project.',
  },
  eventAttendanceExportText: {
    id: 'app.containers.AdminPage.ProjectEvents.eventAttendanceExportText',
    defaultMessage:
      'In order to see event attendees, go to the {userTabLink} tab and create a smart group for the event. {supportArticleLink}.',
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
  attendanceSupportArticleLink: {
    id: 'app.containers.AdminPage.ProjectEvents.attendanceSupportArticleLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/5481527-adding-events-to-your-platform',
  },
  mapSelectionLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.mapSelectionLabel2',
    defaultMessage:
      'Refine where your event location marker is shown by clicking on the map:',
  },
  eventImage: {
    id: 'app.containers.AdminPage.ProjectEvents.eventImage',
    defaultMessage: 'Event image',
  },
  addressOneLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.addressOneLabel',
    defaultMessage: 'Address 1',
  },
  addressTwoLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.addressTwoLabel',
    defaultMessage: 'Address 2',
  },
  eventDates: {
    id: 'app.containers.AdminPage.ProjectEvents.eventDates',
    defaultMessage: 'Event dates',
  },
  eventLocation: {
    id: 'app.containers.AdminPage.ProjectEvents.eventLocation',
    defaultMessage: 'Event Location',
  },
  addressTwoPlaceholder: {
    id: 'app.containers.AdminPage.ProjectEvents.addressTwoPlaceholder',
    defaultMessage: 'E.g. Apt, Suite, Building',
  },
  additionalInformation: {
    id: 'app.containers.AdminPage.ProjectEvents.additionalInformation',
    defaultMessage: 'Additional information',
  },
  refineOnMap: {
    id: 'app.containers.AdminPage.ProjectEvents.refineOnMap',
    defaultMessage: 'Refine location on map',
  },
  searchForLocation: {
    id: 'app.containers.AdminPage.ProjectEvents.searchForLocation',
    defaultMessage: 'Search for a location',
  },
  refineLocationCoordinates: {
    id: 'app.containers.AdminPage.ProjectEvents.refineLocationCoordinates',
    defaultMessage: 'Refine map location',
  },
  addressOneTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.addressOneTooltip',
    defaultMessage: 'Street address of the event location',
  },
  addressTwoTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.addressTwoTooltip',
    defaultMessage:
      'Additional address information that could help identify the location such as a building name, floor number, etc.',
  },
  attendanceButton: {
    id: 'app.containers.AdminPage.ProjectEvents.attendanceButton',
    defaultMessage: 'Attendance button',
  },
  toggleCustomAttendanceButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleCustomAttendanceButtonLabel',
    defaultMessage: 'Link the button to an external URL',
  },
  toggleCustomAttendanceButtonTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleCustomAttendanceButtonTooltip',
    defaultMessage:
      'By default, the in-platform attendance button will be shown allowing users to register their interest in an event. You can change this to link to an external URL instead.',
  },
  customButtonText: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonText',
    defaultMessage: 'Custom button text',
  },
  customButtonTextTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonTextTooltip2',
    defaultMessage:
      'Set the button text to a value other than "Attend" when an external URL is set.',
  },
  customButtonLink: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonLink',
    defaultMessage: 'External link',
  },
  customButtonLinkTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonLinkTooltip2',
    defaultMessage:
      'Add a link to an external URL (E.g. Event service or ticketing website). Setting this will override the default attendance button behavior.',
  },
  preview: {
    id: 'app.containers.AdminPage.ProjectEvents.preview',
    defaultMessage: 'Preview',
  },
  attend: {
    id: 'app.containers.AdminPage.ProjectEvents.attend',
    defaultMessage: 'Attend',
  },
});
