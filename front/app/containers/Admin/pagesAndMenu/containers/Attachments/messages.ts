import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.pageTitle',
    defaultMessage: 'Attachments',
  },
  pageMetaTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.pageMetaTitle',
    defaultMessage: 'Attachments | {orgName}',
  },
  contentEditorTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.contentEditorTitle',
    defaultMessage: 'Content',
  },
  saveButton: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.saveButton',
    defaultMessage: 'Save attachments',
  },
  saveAndEnableButton: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.saveAndEnableButton',
    defaultMessage: 'Save and enable attachments',
  },
  buttonSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.messageSuccess',
    defaultMessage: 'Attachments saved',
  },
  error: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.error',
    defaultMessage: "Couldn't save attachments",
  },
  attachmentUploadLabel: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.attachmentUploadLabel',
    defaultMessage: 'Attachments (max 50MB)',
  },
  attachmentUploadTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.containers.AttachmentsSection.fileUploadLabelTooltip',
    defaultMessage:
      'Attachments should not be larger than 50MB. Added files will be shown on the bottom of this page',
  },
});
