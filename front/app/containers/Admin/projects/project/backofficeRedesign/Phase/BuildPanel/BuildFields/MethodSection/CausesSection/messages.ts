import { defineMessages } from 'react-intl';

export default defineMessages({
  causesSection: {
    id: 'app.containers.Admin.projects.project.causesSection',
    defaultMessage: 'Causes',
  },
  nCauses: {
    id: 'app.containers.Admin.projects.project.nCauses',
    defaultMessage: '{count, plural, one {# cause} other {# causes}}',
  },
  nSignedUp: {
    id: 'app.containers.Admin.projects.project.nSignedUp',
    defaultMessage: '{count, plural, =0 {No sign-ups yet} other {# signed up}}',
  },
  showCauses: {
    id: 'app.containers.Admin.projects.project.showCauses',
    defaultMessage: 'Show causes',
  },
  hideCauses: {
    id: 'app.containers.Admin.projects.project.hideCauses',
    defaultMessage: 'Hide causes',
  },
  addACause: {
    id: 'app.containers.Admin.projects.project.addACause',
    defaultMessage: 'Add a cause',
  },
  deleteCause: {
    id: 'app.containers.Admin.projects.project.deleteCause',
    defaultMessage: 'Delete cause',
  },
  deleteCauseTitle: {
    id: 'app.containers.Admin.projects.project.deleteCauseTitle',
    defaultMessage: 'Delete this cause?',
  },
  deleteCauseDescription: {
    id: 'app.containers.Admin.projects.project.deleteCauseDescription',
    defaultMessage:
      'The cause and its sign-ups are removed from this phase. This cannot be undone.',
  },
  downloadVolunteers: {
    id: 'app.containers.Admin.projects.project.downloadVolunteers',
    defaultMessage: 'Download volunteers',
  },
  nobodySignedUpYet: {
    id: 'app.containers.Admin.projects.project.nobodySignedUpYet',
    defaultMessage: 'Nobody has signed up yet',
  },
  causeCancel: {
    id: 'app.containers.Admin.projects.project.causeCancel',
    defaultMessage: 'Cancel',
  },
});
