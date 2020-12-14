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
  editedPostSave: {
    id: 'app.containers.IdeasEditPage.editedPostSave',
    defaultMessage: 'Save',
  },
  fileUploadError: {
    id: 'app.containers.IdeasEditPage.fileUploadError',
    defaultMessage:
      'One or more files failed to upload. Please check the file size and format and try again.',
  },
  ideasEditMetaTitle: {
    id: 'app.containers.IdeasEditPage.ideasEditMetaTitle',
    defaultMessage: 'Edit {postTitle} | {projectName}',
  },
  ideasEditMetaDescription: {
    id: 'app.containers.IdeasEditPage.ideasEditMetaDescription',
    defaultMessage: 'Edit your post. Add new and change old information.',
  },
});
