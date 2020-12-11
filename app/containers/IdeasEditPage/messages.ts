import { defineMessages } from 'react-intl';

export default defineMessages({
  formTitle: {
    id: 'app.containers.IdeasEditPage.formTitle',
    defaultMessage: 'Edit idea',
  },
  save: {
    id: 'app.containers.IdeasEditPage.save',
    defaultMessage: 'Save',
  },
  submitError: {
    id: 'app.containers.IdeasEditPage.submitError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  submit: {
    id: 'app.containers.IdeasEditPage.submit',
    defaultMessage: 'Submit idea',
  },
  fileUploadError: {
    id: 'app.containers.IdeasEditPage.fileUploadError',
    defaultMessage:
      'One or more files failed to upload. Please check the file size and format and try again.',
  },
  metaTitle: {
    id: 'app.containers.IdeasEditPage.metaTitle',
    defaultMessage: 'Edit your idea for {projectName} | {orgName}',
  },
  metaDescription: {
    id: 'app.containers.IdeasEditPage.metaDescription',
    defaultMessage:
      'Edit your idea. Add new and change old information to make it even better.',
  },
});
