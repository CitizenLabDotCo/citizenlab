import { defineMessages } from 'react-intl';

export default defineMessages({
  publishButton: {
    id: 'app.containers.Admin.projects.project.publishButton',
    defaultMessage: 'Publish',
  },
  publishButtonLive: {
    id: 'app.containers.Admin.projects.project.publishButtonLive',
    defaultMessage: 'Live',
  },
  publishStateDraft: {
    id: 'app.containers.Admin.projects.project.publishStateDraft',
    defaultMessage: 'Not published yet',
  },
  publishStateScheduled: {
    id: 'app.containers.Admin.projects.project.publishStateScheduled',
    defaultMessage: 'Scheduled',
  },
  publishStateScheduledAt: {
    id: 'app.containers.Admin.projects.project.publishStateScheduledAt',
    defaultMessage: 'Scheduled for {date} at {time}',
  },
  publishStatePublished: {
    id: 'app.containers.Admin.projects.project.publishStatePublished',
    defaultMessage: 'Published',
  },
  publishStateArchived: {
    id: 'app.containers.Admin.projects.project.publishStateArchived',
    defaultMessage: 'Archived',
  },
  publishSendEmail: {
    id: 'app.containers.Admin.projects.project.publishSendEmail',
    defaultMessage: 'Send a "Project published" email',
  },
  publishEmailRecipients: {
    id: 'app.containers.Admin.projects.project.publishEmailRecipients',
    defaultMessage:
      '\u2248 {count} recipients. Everyone who follows this project or has taken part will get it.',
  },
  publishChooseGroups: {
    id: 'app.containers.Admin.projects.project.publishChooseGroups',
    defaultMessage: 'Choose which groups can open it',
  },
  publishGroupsSaveFailed: {
    id: 'app.containers.Admin.projects.project.publishGroupsSaveFailed',
    defaultMessage: "That change couldn't be saved. Please try again.",
  },
  publishNoGroups: {
    id: 'app.containers.Admin.projects.project.publishNoGroups',
    defaultMessage: 'There are no user groups yet. Create them under Users.',
  },
  publishEmailUnavailable: {
    id: 'app.containers.Admin.projects.project.publishEmailUnavailable',
    defaultMessage: 'Make the project public to email people about it.',
  },
  publishSchedule: {
    id: 'app.containers.Admin.projects.project.publishSchedule',
    defaultMessage: 'Schedule',
  },
  publishNow: {
    id: 'app.containers.Admin.projects.project.publishNow',
    defaultMessage: 'Publish now',
  },
  publishRestoreToDraftTitle: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftTitle',
    defaultMessage: 'Restore to draft?',
  },
  publishCancel: {
    id: 'app.containers.Admin.projects.project.publishCancel',
    defaultMessage: 'Cancel',
  },
  publishMoveToArchive: {
    id: 'app.containers.Admin.projects.project.publishMoveToArchive',
    defaultMessage: 'Move to archive',
  },
  publishRestoreToDraftFromArchiveBody: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftFromArchiveBody',
    defaultMessage:
      'The project moves out of the archive and back to draft. It stays hidden from residents until you publish it again.',
  },
  publishArchiveTitle: {
    id: 'app.containers.Admin.projects.project.publishArchiveTitle',
    defaultMessage: 'Archive this project?',
  },
  publishArchiveBody2: {
    id: 'app.containers.Admin.projects.project.publishArchiveBody2',
    defaultMessage:
      'The project moves to the archive. Residents can still see it and its results, but can no longer take part. Everything stays saved and you can restore it to draft at any time.',
  },
  publishRestoreToDraftBody2: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftBody2',
    defaultMessage:
      'The project goes back to draft. Residents can no longer see it or take part. If projects need approval on this platform, it has to be approved again before you can publish it.',
  },
  publishMissingTitle: {
    id: 'app.containers.Admin.projects.project.publishMissingTitle',
    defaultMessage: 'Publish project',
  },
  publishMissingBody: {
    id: 'app.containers.Admin.projects.project.publishMissingBody',
    defaultMessage:
      '{missing, plural, one {# of {total} essentials is not set yet. The project will go live without it, and you can add it later.} other {# of {total} essentials are not set yet. The project will go live without them, and you can add them later.}}',
  },
  publishMissingScheduleTitle: {
    id: 'app.containers.Admin.projects.project.publishMissingScheduleTitle',
    defaultMessage: 'Schedule project',
  },
  publishMissingScheduleConfirm: {
    id: 'app.containers.Admin.projects.project.publishMissingScheduleConfirm',
    defaultMessage: 'Continue to schedule',
  },
  publishMissingBack: {
    id: 'app.containers.Admin.projects.project.publishMissingBack',
    defaultMessage: 'Back to setup',
  },
  publishMissingConfirm: {
    id: 'app.containers.Admin.projects.project.publishMissingConfirm',
    defaultMessage: 'Publish',
  },
});
