import { defineMessages } from 'react-intl';

export default defineMessages({
  subtitleAreas: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleAreas',
    defaultMessage: 'Define the geographical areas (neighbourhoods, suburbs, …) that you can ask users who register on the platform. Areas can be linked to projects and can be used to create Smart Groups and give particular groups access to certain projects.',
  },
  titleAreas: {
    id: 'app.containers.AdminPage.SettingsPage.titleAreas',
    defaultMessage: 'Areas configuration',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.editButtonLabel',
    defaultMessage: 'Edit',
  },
  addAreaButton: {
    id: 'app.containers.AdminPage.SettingsPage.addAreaButton',
    defaultMessage: 'Add area',
  },
  areaDeletionConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.areaDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this area?',
  },
  fieldTitle: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTitle',
    defaultMessage: 'Area name',
  },
  fieldTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldTitleTooltip',
    defaultMessage: 'The name you choose for each area will be visible for citizens during signup and when filtering projects.',
  },
  fieldDescription: {
    id: 'app.containers.AdminPage.SettingsPage.fieldDescription',
    defaultMessage: 'Area description',
  },
  fieldDescriptionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldDescriptionTooltip',
    defaultMessage: 'This description is only for internal collaboration with other administrators, to have a clear understanding what is meant by each area.',
  },
  editFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.editFormTitle',
    defaultMessage: 'Edit area',
  },
});
