import { defineMessages } from 'react-intl';

export default defineMessages({
  openEnded: {
    id: 'app.components.admin.DatePhasePicker.Input.openEnded',
    defaultMessage: 'Open ended',
  },
  startTime: {
    id: 'app.components.admin.DatePhasePicker.Input.startTime',
    defaultMessage: 'Start time:',
  },
  endTime: {
    id: 'app.components.admin.DatePhasePicker.Input.endTime',
    defaultMessage: 'End time:',
  },
  sameDaySelection: {
    id: 'app.components.admin.DatePhasePicker.Input.sameDaySelection',
    defaultMessage: 'Single day phase selected',
  },
  sameDaySelectionWarning: {
    id: 'app.components.admin.DatePhasePicker.Input.sameDaySelectionWarning',
    defaultMessage:
      'Minimum phase duration is 24 hours (Automatically start at 12:00 AM and end at midnight).',
  },
});
