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
  refineOnMapInstructions: {
    id: 'app.containers.AdminPage.ProjectEvents.refineOnMapInstructions',
    defaultMessage:
      'You can refine where your event location marker is shown by clicking on the map below.',
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
  registrationLimit: {
    id: 'app.containers.AdminPage.ProjectEvents.registrationLimit',
    defaultMessage: 'Registration limit',
  },
  toggleRegistrationLimitLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleRegistrationLimitLabel',
    defaultMessage: 'Limit the number of event registrants',
  },
  toggleRegistrationLimitTooltip: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleRegistrationLimitTooltip',
    defaultMessage:
      'Set a maximum number of event registrants. If the limit is reached, no further registrations will be accepted.',
  },
  maximumRegistrants: {
    id: 'app.containers.AdminPage.ProjectEvents.maximumRegistrants',
    defaultMessage: 'Maximum registrants',
  },
  registerButton: {
    id: 'app.containers.AdminPage.ProjectEvents.registerButton',
    defaultMessage: 'Register button',
  },
  toggleCustomRegisterButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleCustomRegisterButtonLabel',
    defaultMessage: 'Link the button to an external URL',
  },
  toggleCustomRegisterButtonTooltip2: {
    id: 'app.containers.AdminPage.ProjectEvents.toggleCustomRegisterButtonTooltip2',
    defaultMessage:
      'By default, the in-platform event register button will be shown, allowing users to register for an event. You can change this to link to an external URL instead.',
  },
  customButtonText: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonText',
    defaultMessage: 'Custom button text',
  },
  customButtonTextTooltip3: {
    id: 'app.containers.AdminPage.ProjectEvents.customButtonTextTooltip3',
    defaultMessage:
      'Set the button text to a value other than "Register" when an external URL is set.',
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
  register: {
    id: 'app.containers.AdminPage.ProjectEvents.register',
    defaultMessage: 'Register',
  },
  exportRegistrants: {
    id: 'app.containers.AdminPage.ProjectEvents.exportRegistrants',
    defaultMessage: 'Export registrants',
  },
  registrants: {
    id: 'app.containers.AdminPage.ProjectEvents.registrants',
    defaultMessage: 'registrants',
  },
  registrant: {
    id: 'app.containers.AdminPage.ProjectEvents.registrant',
    defaultMessage: 'registrant',
  },
  eventImageAltTextTitle: {
    id: 'app.containers.AdminPage.ProjectEvents.eventImageAltTextTitle',
    defaultMessage: 'Event image alternative text',
  },
});
