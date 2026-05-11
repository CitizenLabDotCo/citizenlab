import { defineMessages } from 'react-intl';

export default defineMessages({
  dateStartLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.dateStartLabel',
    defaultMessage: 'Starting date & time',
  },
  datesEndLabel: {
    id: 'app.containers.AdminPage.ProjectEvents.datesEndLabel',
    defaultMessage: 'End date & time',
  },
  timezoneInfo: {
    id: 'app.containers.AdminPage.ProjectEvents.timezoneInfo',
    defaultMessage:
      'Events must be added in the timezone of the platform ({timezone}). End users will see the date in their own timezone.',
  },
});
