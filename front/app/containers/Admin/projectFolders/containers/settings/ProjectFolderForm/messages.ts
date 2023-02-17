import { defineMessages } from 'react-intl';

export default defineMessages({
  imageSupportPageURL: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.imageSupportPageURL',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  supportPageLinkText: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.supportPageLinkText',
    defaultMessage: 'visit our support center',
  },
  folderCardImageTooltip: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.folderCardImageTooltip1',
    defaultMessage: `
    This image is part of the folder card; the card that summarizes the folder and is shown on the homepage for example. For more information on recommended image resolutions, {supportPageLink}.`,
  },
  headerImageTooltip: {
    id: 'app.containers.Admin.projectFolders.containers.settings.ProjectFolderForm.headerImageTooltip1',
    defaultMessage: `
    This image is shown at the top of the folder page. For more information on recommended image resolutions, {supportPageLink}.`,
  },
});
