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
  imageTextCards: {
    id: 'app.containers.admin.ContentBuilder.imageTextCards',
    defaultMessage: 'Image & text cards',
  },
  infoWithAccordions: {
    id: 'app.containers.admin.ContentBuilder.infoWithAccordions',
    defaultMessage: 'Info & accordions',
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
});
