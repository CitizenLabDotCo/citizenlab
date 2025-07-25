import { defineMessages } from 'react-intl';

export default defineMessages({
  attachFiles: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFiles',
    defaultMessage: 'Attach files',
  },
  attachFilesTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesTooltip',
    defaultMessage:
      'Attach files to provide additional context to the AI to support analysis.',
  },
  attachFilesDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesDescription',
    defaultMessage: 'The AI will consider these files when providing answers:',
  },
  save: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.save',
    defaultMessage: 'Save',
  },
  addFilesTabMessageWithLink: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.addFilesTabMessageWithLink',
    defaultMessage: 'You can add additional files in the {filesTab}.',
  },
  filesTabLink: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.filesTabLink',
    defaultMessage: 'Files tab',
  },
  filesTab: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.filesTab',
    defaultMessage: 'Files tab',
  },
});
