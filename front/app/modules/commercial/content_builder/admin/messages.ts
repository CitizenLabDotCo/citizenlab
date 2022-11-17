import { defineMessages } from 'react-intl';

export default defineMessages({
  sections: {
    id: 'app.containers.admin.ContentBuilder.sections',
    defaultMessage: 'SECTIONS',
  },
  content: {
    id: 'app.containers.admin.ContentBuilder.content',
    defaultMessage: 'CONTENT',
  },
  layout: {
    id: 'app.containers.admin.ContentBuilder.layout',
    defaultMessage: 'LAYOUT',
  },
  projectDescription: {
    id: 'app.containers.admin.ContentBuilder.projectDescription',
    defaultMessage: 'Project description',
  },
  oneColumn: {
    id: 'app.containers.admin.ContentBuilder.oneColumnLayout',
    defaultMessage: '1 column',
  },
  twoColumn: {
    id: 'app.containers.admin.ContentBuilder.twoColumnLayout',
    defaultMessage: '2 column',
  },
  twoEvenColumn: {
    id: 'app.containers.admin.ContentBuilder.twoEvenColumnLayout',
    defaultMessage: '2 even columns',
  },
  twoColumnVariant1and2: {
    id: 'app.containers.admin.ContentBuilder.twoColumnLayoutVariant1-2',
    defaultMessage: '2 columns with 30% and 60% width respectively',
  },
  twoColumnVariant2and1: {
    id: 'app.containers.admin.ContentBuilder.twoColumnLayoutVariant2-1',
    defaultMessage: '2 columns with 60% and 30% width respectively',
  },
  threeColumn: {
    id: 'app.containers.admin.ContentBuilder.threeColumnLayout',
    defaultMessage: '3 column',
  },
  text: {
    id: 'app.containers.admin.ContentBuilder.text',
    defaultMessage: 'Text',
  },
  url: {
    id: 'app.containers.admin.ContentBuilder.url',
    defaultMessage: 'Embed',
  },
  error: {
    id: 'app.containers.admin.ContentBuilder.error',
    defaultMessage: 'error',
  },
  errorMessage: {
    id: 'app.containers.admin.ContentBuilder.errorMessage',
    defaultMessage:
      'There is an error on { locale } content, please fix the issue to be able to save your changes',
  },
  embedIframeUrlLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeUrlLabel',
    defaultMessage: 'Website address',
  },
  embedIframeUrlLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeUrlLabelTooltip',
    defaultMessage: 'Full URL of the website you want to embed.',
  },
  embedIframeHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeHeightLabel',
    defaultMessage: 'Embed height (pixels)',
  },
  embedIframeHeightLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeHeightLabelTooltip',
    defaultMessage:
      'Height you want your embedded content to appear on the page (in pixels).',
  },
  iframeHeightPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.iframeHeightPlaceholder',
    defaultMessage: '300',
  },
  embedIframeTitleLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeTitleLabel',
    defaultMessage: 'Short description of the content you are embedding',
  },
  embedIframeTitleTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeTitleTooltip',
    defaultMessage:
      'It is useful to provide this information for users who rely on a screen reader or other assistive technology.',
  },
  iframeInvalidUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlErrorMessage',
    defaultMessage:
      'Enter a valid web address, for example https://example.com',
  },
  iframeDescription: {
    id: 'app.containers.admin.ContentBuilder.iframeDescription',
    defaultMessage:
      'Display content from an external website on your page in an HTML iFrame.',
  },
  iframeInvalidWhitelistUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeInvalidWhitelistUrlErrorMessage',
    defaultMessage:
      'Sorry, this content could not be embedded. {visitLinkMessage} to learn more.',
  },
  iframeEmbedVisitLinkMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeEmbedVisitLinkMessage',
    defaultMessage: 'Visit our support page',
  },
  iframeSupportLink: {
    id: 'app.containers.admin.ContentBuilder.iframeSupportLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/6354058-embedding-elements-in-the-content-builder-to-enrich-project-descriptions',
  },
  imageTextCards: {
    id: 'app.containers.admin.ContentBuilder.imageTextCards',
    defaultMessage: 'Image & text cards',
  },
  infoWithAccordions: {
    id: 'app.containers.admin.ContentBuilder.infoWithAccordions',
    defaultMessage: 'Info & accordions',
  },
  image: {
    id: 'app.containers.admin.ContentBuilder.image',
    defaultMessage: 'Image',
  },
  imageAltTextLabel: {
    id: 'app.containers.admin.ContentBuilder.imageAltTextLabel',
    defaultMessage: 'Short description of the image',
  },
  imageAltTextTooltip: {
    id: 'app.containers.admin.ContentBuilder.imageAltTextTooltip',
    defaultMessage:
      'Adding "alt text" for images is important to make your platform accessible for users using screen readers.',
  },
  textValue: {
    id: 'app.containers.admin.ContentBuilder.textValue',
    defaultMessage:
      'This is some text. You can edit and format it by using the editor in the panel on the right.',
  },
  delete: {
    id: 'app.containers.admin.ContentBuilder.delete',
    defaultMessage: 'Delete',
  },
  default: {
    id: 'app.containers.admin.ContentBuilder.default',
    defaultMessage: 'default',
  },
  toggleLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.toggleLabel',
    defaultMessage: 'Use Content Builder for description',
  },
  toggleTooltip: {
    id: 'app.containers.AdminPage.ProjectDescription.toggleTooltip',
    defaultMessage:
      'Using the Content Builder will let you use more advanced layout options.',
  },
  linkText: {
    id: 'app.containers.AdminPage.ProjectDescription.linkText',
    defaultMessage: 'Edit description in Content Builder',
  },
  layoutBuilderWarning: {
    id: 'app.containers.AdminPage.ProjectDescription.layoutBuilderWarning',
    defaultMessage:
      'Using the Content Builder will let you use more advanced layout options. For languages where no content is available in the content builder, the regular project description content will be displayed instead.',
  },
  columnLayoutRadioLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.columnLayoutRadioLabel',
    defaultMessage: 'Column layout',
  },
  whiteSpace: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpace',
    defaultMessage: 'White space',
  },
  whiteSpaceRadioLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpaceRadioLabel',
    defaultMessage: 'Vertical height',
  },
  whiteSpaceRadioSmall: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpaceRadioSmall',
    defaultMessage: 'Small',
  },
  whiteSpaceRadioMedium: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpaceRadioMedium',
    defaultMessage: 'Medium',
  },
  whiteSpaceRadioLarge: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpaceRadioLarge',
    defaultMessage: 'Large',
  },
  whiteSpaceDividerLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.whiteSpaceDividerLabel',
    defaultMessage: 'Include border',
  },
  a11y_closeSettingsPanel: {
    id: 'app.containers.AdminPage.ProjectDescription.a11y_closeSettingsPanel',
    defaultMessage: 'Close settings panel',
  },
  urlPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.urlPlaceholder',
    defaultMessage: 'https://example.com',
  },
});
