import { defineMessages } from 'react-intl';

export default defineMessages({
  whoCanFindIt: {
    id: 'app.containers.Admin.projects.NewProjectForm.whoCanFindIt',
    defaultMessage: 'Who can find it',
  },
  public: {
    id: 'app.containers.Admin.projects.NewProjectForm.public',
    defaultMessage: 'Public',
  },
  publicDescription: {
    id: 'app.containers.Admin.projects.NewProjectForm.publicDescription',
    defaultMessage:
      'Appears on the homepage, in the project list and in search.',
  },
  private: {
    id: 'app.containers.Admin.projects.NewProjectForm.private',
    defaultMessage: 'Private',
  },
  privateDescription: {
    id: 'app.containers.Admin.projects.NewProjectForm.privateDescription',
    defaultMessage:
      'Hidden from those places. Only people with the link can reach it.',
  },
  cancel: {
    id: 'app.containers.Admin.projects.NewProjectForm.cancel',
    defaultMessage: 'Cancel',
  },
  createProject: {
    id: 'app.containers.Admin.projects.NewProjectForm.createProject',
    defaultMessage: 'Create project',
  },
  createError: {
    id: 'app.containers.Admin.projects.NewProjectForm.createError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});
