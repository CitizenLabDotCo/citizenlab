import { defineMessages } from 'react-intl';

export default defineMessages({
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
  iframeUrlLabel: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlLabel',
    defaultMessage: 'Website address',
  },
  iframeUrlLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlLabelTooltip',
    defaultMessage: 'Full URL of the website you want to embed.',
  },
  iframeHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.iframeHeightLabel',
    defaultMessage: 'Embed height (pixels)',
  },
  iframeHeightLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.iframeHeightLabelTooltip',
    defaultMessage:
      'Height you want your embedded content to appear on the page (in pixels)',
  },
  iframeUrlPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlPlaceholder',
    defaultMessage: 'https://example.com',
  },
  iframeHeightPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.iframeHeightPlaceholder',
    defaultMessage: '300',
  },
  iframeTitleLabel: {
    id: 'app.containers.admin.ContentBuilder.iframeTitleLabel',
    defaultMessage: 'Short description of the content you are embedding',
  },
  iframeTitleTooltip: {
    id: 'app.containers.admin.ContentBuilder.iframeTitleTooltip',
    defaultMessage:
      'It is useful to provide this information for users who rely on a screenreader or other assistive technology.',
  },
  iframeInvalidUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlErrorMessage',
    defaultMessage:
      'Enter a valid web address, for example https://example.com',
  },
  iframeWhitelistUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeWhitelistUrlErrorMessage',
    defaultMessage:
      'You cannot embed content from this website for security reasons, try something else.',
  },
  aboutBox: {
    id: 'app.containers.admin.ContentBuilder.aboutBox',
    defaultMessage: 'About box',
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
  toggleLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.toggleLabel',
    defaultMessage: 'Use page builder for description',
  },
  toggleTooltip: {
    id: 'app.containers.AdminPage.ProjectDescription.toggleTooltip',
    defaultMessage:
      'Using the page builder will let you use more advanced layout options.',
  },
  linkText: {
    id: 'app.containers.AdminPage.ProjectDescription.linkText',
    defaultMessage: 'Edit description in page builder',
  },
  layoutBuilderWarning: {
    id: 'app.containers.AdminPage.ProjectDescription.layoutBuilderWarning',
    defaultMessage:
      'Using the page builder will let you use more advanced layout options. For languages where no content is available in the page builder, the regular project description content will be displayed instead.',
  },
  columnLayoutRadioLabel: {
    id: 'app.containers.AdminPage.ProjectDescription.columnLayoutRadioLabel',
    defaultMessage: 'Column layout',
  },
});
