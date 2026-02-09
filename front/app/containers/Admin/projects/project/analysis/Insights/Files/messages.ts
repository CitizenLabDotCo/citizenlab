import { defineMessages } from 'react-intl';

export default defineMessages({
  attachFiles: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFiles',
    defaultMessage: 'Attach files',
  },
  attachFilesWithCurrentCount: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesWithCurrentCount',
    defaultMessage: 'Attach files ({numberAttachedFiles})',
  },
  attachFilesFromProject: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesFromProject2',
    defaultMessage: 'Select files from project',
  },
  attachFilesTooltip: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesTooltip',
    defaultMessage:
      'Attach files to provide additional context to the AI to support analysis.',
  },
  attachFilesDescription: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.attachFilesDescription2',
    defaultMessage: 'These files will be sent along to the AI during analysis.',
  },
  save: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.save',
    defaultMessage: 'Save',
  },
  manageFiles: {
    id: 'app.containers.AdminPage.projects.project.analysis.files.manageFiles',
    defaultMessage: 'Manage project files',
  },
});
