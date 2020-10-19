/*
 *.admin.ideas.all Messages
 *
 * This contains all the text for the.admin.ideas.all component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.admin.ideas.all.helmetTitle',
    defaultMessage: 'Admin ideas page',
  },
  helmetDescription: {
    id: 'app.containers.admin.ideas.all.helmetDescription',
    defaultMessage: 'Admin ideas page',
  },
  pageTitle: {
    id: 'app.containers.admin.ideas.all.header',
    defaultMessage: 'Ideas',
  },
  pageSubtitle: {
    id: 'app.containers.admin.ideas.all.headerSubtitle',
    defaultMessage:
      'Give feedback on ideas, add topics to them or bring them from one project to another.',
  },
  tabManage: {
    id: 'app.containers.admin.ideas.all.tabManage',
    defaultMessage: 'Manage',
  },
  tabCustomize: {
    id: 'app.containers.admin.ideas.all.tabCustomizeStatuses',
    defaultMessage: 'Customize Statuses',
  },
  required: {
    id: 'app.containers.admin.ideas.all.required',
    defaultMessage: 'Required',
  },
  deleteButtonLabel: {
    id: 'app.containers.admin.ideas.all.delete',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.admin.ideas.all.manage',
    defaultMessage: 'Manage',
  },
  systemField: {
    id: 'app.containers.admin.ideas.all.default',
    defaultMessage: 'Default',
  },
  addIdeaStatus: {
    id: 'app.containers.admin.ideas.all.addStatus',
    defaultMessage: 'Add Status',
  },
  titleIdeaStatuses: {
    id: 'app.containers.admin.ideas.all.titleIdeaStatuses',
    defaultMessage: 'Customize Statuses',
  },
  subtitleIdeaStatuses: {
    id: 'app.containers.admin.ideas.all.subtitleIdeaStatuses',
    defaultMessage:
      "Rename, move, add or change the colors of an idea's lifecycle status.",
  },
  ideasCount: {
    id: 'app.containers.admin.ideas.all.ideasCount',
    defaultMessage: 'ideas',
  },
  deleteButtonTooltip: {
    id: 'app.containers.admin.ideas.all.disabledDeleteButtonTooltip',
    defaultMessage:
      'Cannot delete a status that has been assigned to ideas. Make sure to reassign your ideas to another status first.',
  },
  lockedStatusTooltip: {
    id: 'app.containers.admin.ideas.all.lockedStatusTooltip',
    defaultMessage:
      'This is the default Status and it cannot be removed or moved.',
  },
  fieldTitle: {
    id: 'app.containers.admin.ideas.form.fieldTitle',
    defaultMessage: 'Status Name',
  },
  fieldTitleTooltip: {
    id: 'app.containers.admin.ideas.form.fieldTitleTooltip',
    defaultMessage: 'How the status will be displayed in different languages',
  },
  fieldDescription: {
    id: 'app.containers.admin.ideas.form.fieldDescription',
    defaultMessage: 'Status Description',
  },
  fieldDescriptionTooltip: {
    id: 'app.containers.admin.ideas.form.fieldDescriptionTooltip',
    defaultMessage:
      'A short description of the status and what it means for ideas assigned to it.',
  },
  fieldColor: {
    id: 'app.containers.admin.ideas.form.fieldColor',
    defaultMessage: 'Color',
  },
  fieldColorTooltip: {
    id: 'app.containers.admin.ideas.form.fieldColorTooltip',
    defaultMessage:
      'A short description of the status and what it means for ideas assigned to it.',
  },
  fieldCode: {
    id: 'app.containers.admin.ideas.form.fieldCode',
    defaultMessage: 'Semantic Code',
  },
  fieldCodeTooltip: {
    id: 'app.containers.admin.ideas.form.fieldCodeTooltip',
    defaultMessage:
      'A short Code of the status and what it means for ideas assigned to it.',
  },
});
