import { defineMessages } from 'react-intl';

export default defineMessages({
  headerImageSupportPageURL: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.headerImageSupportPageURL',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  headerImageTooltip: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.headerImageTooltip',
    defaultMessage: `
    This image is part of the folder card; the card that summarizes the folder and is shown on the homepage for example.

    For more information on recommended image resolutions, {supportPageLink}.`,
  },
  headerImageSupportPageText: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.headerImageSupportPageText',
    defaultMessage: 'visit our support center',
  },
});
