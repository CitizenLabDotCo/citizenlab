import { defineMessages } from 'react-intl';

export default defineMessages({
  descriptionFolderHeading: {
    id: 'app.containers.ContentBuilder.PageTitleFolder',
    defaultMessage: 'Folder description',
  },
  viewPublicProject: {
    id: 'app.containers.AdminPage.ProjectDescription.viewPublicProject',
    defaultMessage: 'View project',
  },
  saveError: {
    id: 'app.containers.AdminPage.ProjectDescription.saveError',
    defaultMessage:
      'Something went wrong while saving the project description.',
  },
  saveErrorUnauthorizedFile: {
    id: 'app.containers.AdminPage.ProjectDescription.saveErrorUnauthorizedFile',
    defaultMessage:
      "The description wasn't saved because you can't use one of the files you added. Remove it, or ask an admin to add it.",
  },
});
