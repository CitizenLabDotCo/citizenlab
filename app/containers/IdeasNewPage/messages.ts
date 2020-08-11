import { defineMessages } from 'react-intl';

export default defineMessages({
  formTitle: {
    id: 'app.containers.IdeasNewPage.formTitle',
    defaultMessage: 'Add your idea',
  },
  submit: {
    id: 'app.containers.IdeasNewPage.submit',
    defaultMessage: 'Submit idea',
  },
  submitError: {
    id: 'app.containers.IdeasNewPage.submitError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  or: {
    id: 'app.containers.IdeasNewPage.or',
    defaultMessage: 'Or',
  },
  goBack: {
    id: 'app.containers.IdeasNewPage.goBack',
    defaultMessage: 'Go back',
  },
  shareViaMessenger: {
    id: 'app.containers.IdeasNewPage.shareViaMessenger',
    defaultMessage: 'Share via Messenger',
  },
  shareOnTwitter: {
    id: 'app.containers.IdeasNewPage.shareOnTwitter',
    defaultMessage: 'Share on Twitter',
  },
  fileOrImageError: {
    id: 'app.containers.IdeasNewPage.fileOrImageError',
    defaultMessage:
      'Your idea was submitted, but a file failed to be uploaded, please edit your idea to try again.',
  },
  metaTitle: {
    id: 'app.containers.IdeasNewPage.metaTitle',
    defaultMessage: 'Add a new idea for {projectName} | {orgName}',
  },
  metaDescription: {
    id: 'app.containers.IdeasNewPage.metaDescription',
    defaultMessage:
      "Add a new idea for {projectName} and have a say in this project's outcome",
  },
});
