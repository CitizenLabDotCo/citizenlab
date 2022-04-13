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
  threeColumn: {
    id: 'app.containers.admin.ContentBuilder.threeColumnLayout',
    defaultMessage: '3 column',
  },
  text: {
    id: 'app.containers.admin.ContentBuilder.text',
    defaultMessage: 'Text',
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
});
