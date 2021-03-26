import { defineMessages } from 'react-intl';

export default defineMessages({
  subtitleAreas: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleAreas',
    defaultMessage:
      'Define the geographical areas (neighbourhoods, suburbs, …) that you can ask users who register on the platform. Areas can be linked to projects and can be used to create Smart Groups and give particular groups access to certain projects.',
  },
  titleAreas: {
    id: 'app.containers.AdminPage.SettingsPage.titleAreas',
    defaultMessage: 'Areas configuration',
  },
  subtitleTerminology: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleTerminology',
    defaultMessage: 'Terminology',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.areas.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.SettingsPage.areas.editButtonLabel',
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
    defaultMessage:
      'The name you choose for each area will be visible for citizens during signup and when filtering projects.',
  },
  fieldDescription: {
    id: 'app.containers.AdminPage.SettingsPage.fieldDescription',
    defaultMessage: 'Area description',
  },
  fieldDescriptionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fieldDescriptionTooltip',
    defaultMessage:
      'This description is only for internal collaboration with other administrators, to have a clear understanding what is meant by each area.',
  },
  editFormTitle: {
    id: 'app.containers.AdminPage.SettingsPage.editFormTitle',
    defaultMessage: 'Edit area',
  },
  terminologyTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.terminologyTooltip',
    defaultMessage:
      'How should areas be called towards users? e.g. neighbourhoods, quarters, counties, ...',
  },
  areaTerm: {
    id: 'app.containers.AdminPage.SettingsPage.areaTerm',
    defaultMessage: 'Term for one area (singular)',
  },
  areaTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.areaTermPlaceholder',
    defaultMessage: 'area',
  },
  areasTerm: {
    id: 'app.containers.AdminPage.SettingsPage.areasTerm',
    defaultMessage: 'Term for multiple areas (plural)',
  },
  areasTermPlaceholder: {
    id: 'app.containers.AdminPage.SettingsPage.areasTermPlaceholder',
    defaultMessage: 'areas',
  },
  areasTermsSave: {
    id: 'app.containers.AdminPage.SettingsPage.areasTermsSave',
    defaultMessage: 'Save',
  },
});
