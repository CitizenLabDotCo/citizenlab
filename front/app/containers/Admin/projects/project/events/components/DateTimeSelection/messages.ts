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
    id: 'app.containers.AdminPage.ProjectEvents.timezoneInfo1',
    defaultMessage:
      'Events must be added in the timezone of the platform ({timezone}, GMT{gmtOffset}). End users will see the date in their own timezone.',
  },
});
