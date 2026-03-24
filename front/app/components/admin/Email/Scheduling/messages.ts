import { defineMessages } from 'react-intl';

export default defineMessages({
  scheduleSend: {
    id: 'app.components.Admin.Email.scheduling.scheduleSend',
    defaultMessage: 'Schedule send',
  },
  rescheduleSend: {
    id: 'app.components.Admin.Email.scheduling.rescheduleSend',
    defaultMessage: 'Reschedule',
  },
  cancelSchedule: {
    id: 'app.components.Admin.Email.scheduling.cancelSchedule',
    defaultMessage: 'Cancel Schedule',
  },
  scheduleSendTitle: {
    id: 'app.components.Admin.Email.scheduling.scheduleSendTitle',
    defaultMessage: 'Schedule email',
  },
  scheduleSendDescription: {
    id: 'app.components.Admin.Email.scheduling.scheduleSendDescription',
    defaultMessage: 'When should this email go out?',
  },
  scheduleSendWarning: {
    id: 'app.components.Admin.Email.scheduling.scheduleSendWarning',
    defaultMessage:
      'Note: Sending may be delayed slightly depending on the number of recipients.',
  },
  confirmSchedule: {
    id: 'app.components.Admin.Email.scheduling.confirmSchedule',
    defaultMessage: 'Schedule',
  },
  cancelScheduleTitle: {
    id: 'app.components.Admin.Email.scheduling.cancelScheduleTitle',
    defaultMessage: 'Cancel scheduled email',
  },
  cancelScheduleDescription: {
    id: 'app.components.Admin.Email.scheduling.cancelScheduleDescription',
    defaultMessage:
      'Are you sure you want to cancel the schedule for this campaign? The campaign will no longer be scheduled to send, but you can still send it manually or reschedule it.',
  },
  confirmCancelSchedule: {
    id: 'app.components.Admin.Email.scheduling.confirmCancelSchedule',
    defaultMessage: 'Yes, cancel scheduled email',
  },
  keepSchedule: {
    id: 'app.components.Admin.Email.scheduling.keepSchedule',
    defaultMessage: 'No, keep schedule',
  },
});
