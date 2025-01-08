import { defineMessages } from 'react-intl';

export default defineMessages({
  titleGeneral: {
    id: 'app.containers.AdminPage.ProjectEdit.titleGeneral',
    defaultMessage: 'General settings for the project',
  },
  subtitleGeneral: {
    id: 'app.containers.AdminPage.ProjectEdit.subtitleGeneral',
    defaultMessage: 'Personalize your project. You can change it at anytime.',
  },
  noTitleErrorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.noTitleErrorMessage',
    defaultMessage: 'Please enter a project title',
  },
  titleLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.titleLabel',
    defaultMessage: 'Title',
  },
  titleLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.titleLabelTooltip',
    defaultMessage:
      'Choose a title that is short, engaging and clear. It will be shown in the dropdown overview and on the project cards on the home page.',
  },
  projectTypeTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectTypeTitle',
    defaultMessage: 'Project type',
  },
  projectTypeWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.projectTypeWarning',
    defaultMessage: 'The project type can not be changed later.',
  },
  projectTypeTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectTypeTooltip',
    defaultMessage:
      'Projects with a timeline have a clear beginning and end and can have different phases. Projects without a timeline are continuous.',
  },
  areasLabelHint: {
    id: 'app.containers.AdminPage.ProjectEdit.areasLabelHint',
    defaultMessage: 'Area filter',
  },
  areasLabelTooltipHint: {
    id: 'app.containers.AdminPage.ProjectEdit.areasLabelTooltipHint',
    defaultMessage:
      'Projects can be filtered on the homepage using areas. Areas can be set {areasLabelTooltipLink}.',
  },
  areasLabelTooltipLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.areasLabelTooltipLinkText',
    defaultMessage: 'here',
  },
  topicsLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.topicLabel',
    defaultMessage: 'Tags',
  },
  topicsLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.topicLabelTooltip',
    defaultMessage:
      'Select {topicsCopy} for this project. Users can use these to filter projects by.',
  },
  areasNoneLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.areasNoneLabel',
    defaultMessage: 'No specific area',
  },
  areasNoneLabelDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.areasNoneLabelDescription',
    defaultMessage: 'The project will not show when filtering by area.',
  },
  areasAllLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.areasAllLabel',
    defaultMessage: 'All Areas',
  },
  areasAllLabelDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.areasAllLabelDescription',
    defaultMessage: 'The project will show on every area filter.',
  },
  areasSelectionLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.areasSelectionLabel',
    defaultMessage: 'Selection',
  },
  areasSelectionLabelDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.areasSelectionLabelDescription',
    defaultMessage: 'The project will show on selected area filter(s).',
  },
  projectCardImageLabelText: {
    id: 'app.containers.AdminPage.ProjectEdit.projectCardImageLabelText',
    defaultMessage: 'Project card image',
  },
  fileUploadLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.fileUploadLabel',
    defaultMessage: 'Attach files to this project',
  },
  fileUploadLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.fileUploadLabelTooltip',
    defaultMessage:
      'Files should not be larger than 50Mb. Added files will be shown on the project information page.',
  },
  saveProject: {
    id: 'app.containers.AdminPage.ProjectEdit.saveProject',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.ProjectEdit.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.saveSuccessMessage',
    defaultMessage: 'Your form has been saved!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.saveErrorMessage',
    defaultMessage:
      'An error occurred while saving your data. Please try again.',
  },
  projectName: {
    id: 'app.containers.AdminPage.ProjectEdit.projectName',
    defaultMessage: 'Project name',
  },
  url: {
    id: 'app.containers.AdminPage.ProjectEdit.url',
    defaultMessage: 'URL',
  },
  topicInputsTooltipExtraCopy: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicInputsTooltipExtraCopy',
    defaultMessage: 'Tags can be configured {topicManagerLink}.',
  },
  topicInputsTooltipLink: {
    id: 'app.containers.AdminPage.SettingsPage.AllowedInputTopics.topicInputsTooltipLink',
    defaultMessage: 'here',
  },
  headerImageInputLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.headerImageInputLabel',
    defaultMessage: 'Header image',
  },
  projectHeaderImageTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectHeaderImageTooltip',
    defaultMessage: `
    This image is shown at the top of the project page. For more information on recommended image resolutions, {supportPageLink}.`,
  },
  projectCardImageTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectCardImageTooltip',
    defaultMessage: `
    This image is part of the project card; the card that summarizes the project and is shown on the homepage for example. For more information on recommended image resolutions, {supportPageLink}.`,
  },
  imageSupportPageURL: {
    id: 'app.containers.AdminPage.ProjectEdit.imageSupportPageURL',
    defaultMessage:
      'https://support.govocal.com/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  supportPageLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.supportPageLinkText',
    defaultMessage: 'visit our support center',
  },
  projectImageAltTextTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectImageAltTextTitle1',
    defaultMessage: 'Project card image alternative text',
  },
  altText: {
    id: 'app.containers.AdminPage.ProjectEdit.altText',
    defaultMessage: 'Alt text',
  },
  projectImageAltTextTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectImageAltTextTooltip1',
    defaultMessage:
      'Provide a short description of the image for visually impaired users. This helps screen readers convey what the image is about.',
  },
  headerImageAltText: {
    id: 'app.containers.AdminPage.ProjectEdit.headerImageAltText',
    defaultMessage: 'Header image alt text',
  },
  resetParticipationData: {
    id: 'app.containers.AdminPage.ProjectEdit.resetParticipationData',
    defaultMessage: 'Reset participation data',
  },
  publicationStatusWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.publicationStatusWarningMessage',
    defaultMessage:
      'Looking for the project status? Now you can change it at any time directly from the project page header.',
  },
});
