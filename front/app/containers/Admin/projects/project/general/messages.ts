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
  statusLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.statusLabel',
    defaultMessage: 'Publication status',
  },
  publicationStatusTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.generalTab.publicationStatusTooltip',
    defaultMessage:
      'Choose whether this project is "draft", "published" or "archived" (not shown, shown and active, shown but inactive)',
  },
  draftStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.draftStatus',
    defaultMessage: 'Draft',
  },
  publishedStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.publishedStatus',
    defaultMessage: 'Published',
  },
  archivedStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.archivedStatus',
    defaultMessage: 'Archived',
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
  continuous: {
    id: 'app.containers.AdminPage.ProjectEdit.continuous',
    defaultMessage: 'Continuous',
  },
  timeline: {
    id: 'app.containers.AdminPage.ProjectEdit.timeline',
    defaultMessage: 'Timeline',
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
  headerImageLabelText: {
    id: 'app.containers.AdminPage.ProjectEdit.headerImageLabelText',
    defaultMessage: 'Header image',
  },
  headerImageLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.headerImageLabelTooltip',
    defaultMessage:
      'This image will be shown on top of the project page. The ideal dimensions are described in {imageSupportArticleLink}.',
  },
  projectCardImageLabelText: {
    id: 'app.containers.AdminPage.ProjectEdit.projectCardImageLabelText',
    defaultMessage: 'Project card image',
  },
  projectCardImageLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectCardImageLabelTooltip',
    defaultMessage:
      'This image will be shown on the project card on the home page. The ideal dimensions are a width of 1440 pixels and a height between 1440 and 720 pixels.',
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
  imageSupportArticleLinkTarget: {
    id: 'app.containers.AdminPage.ProjectEdit.imageSupportArticleLinkTarget',
    defaultMessage:
      'http://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  imageSupportArticleLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.imageSupportArticleLinkText',
    defaultMessage: 'this article',
  },
  projectName: {
    id: 'app.containers.AdminPage.ProjectEdit.projectName',
    defaultMessage: 'Project name',
  },
});
