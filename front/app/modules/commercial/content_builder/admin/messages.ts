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
  error: {
    id: 'app.containers.admin.ContentBuilder.error',
    defaultMessage: 'error',
  },
  errorMessage: {
    id: 'app.containers.admin.ContentBuilder.errorMessage',
    defaultMessage:
      'There is an error on { locale } content, please fix the issue to be able to save your changes',
  },
  imageTextCards: {
    id: 'app.containers.admin.ContentBuilder.imageTextCards',
    defaultMessage: 'Image & text cards',
  },
  infoWithAccordions: {
    id: 'app.containers.admin.ContentBuilder.infoWithAccordions',
    defaultMessage: 'Info & accordions',
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
  a11y_closeSettingsPanel: {
    id: 'app.containers.AdminPage.ProjectDescription.a11y_closeSettingsPanel',
    defaultMessage: 'Close settings panel',
  },
  urlPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.urlPlaceholder',
    defaultMessage: 'https://example.com',
  },
});
