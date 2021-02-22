import { defineMessages } from 'react-intl';

export default defineMessages({
  errorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.errorMessage',
    defaultMessage: 'Something went wrong, please try again later',
  },
  layerName: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerName',
    defaultMessage: 'Layer name',
  },
  layerNameTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerNameTooltip',
    defaultMessage: 'This layer name is shown on the map legend',
  },
  layerTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerTooltip',
    defaultMessage: 'Layer tooltip',
  },
  layerTooltipTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerTooltipTooltip',
    defaultMessage:
      'This text is displayed as a tooltip when hovering over the layer features on the map',
  },
  save: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.cancel',
    defaultMessage: 'Cancel editing',
  },
  remove: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.remove',
    defaultMessage: 'Remove layer',
  },
  layers: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layers',
    defaultMessage: 'Map layers',
  },
  mapConfigurationTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapConfigurationTitle',
    defaultMessage: 'Map configuration',
  },
  mapConfigurationDescription: {
    id:
      'app.containers.AdminPage.ProjectEdit.MapTab.mapConfigurationDescription',
    defaultMessage:
      'Customize the map view, including uploading and styling map layers and setting the map center and zoom level.',
  },
  layersTitleTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layersTitleTooltip',
    defaultMessage:
      'We currently support GeoJSON files. Read the support article for tips on how to convert and style map layers.',
  },
  edit: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.edit',
    defaultMessage: 'Edit map layer',
  },
  import: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.import',
    defaultMessage: 'Import GeoJSON file',
  },
  layerColor: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerColor',
    defaultMessage: 'Layer color',
  },
  layerColorTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerColorTooltip',
    defaultMessage:
      'This color is applied to all features within the map layer. Marker sizes, line widths and fill opacity are fixed by default.',
  },
  layerIconName: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerIconName',
    defaultMessage: 'Marker icon',
  },
  layerIconNameTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layerIconNameTooltip',
    defaultMessage:
      'Optionally select an icon that is displayed in the markers. Click {url} to see the list of icons you can select.',
  },
  here: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.here',
    defaultMessage: 'here',
  },
  centerLngLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLngLabel',
    defaultMessage: 'Default center latitude',
  },
  centerLatLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLatLabel',
    defaultMessage: 'Default center longitude',
  },
  zoomLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.zoomLabel',
    defaultMessage: 'Default zoom level',
  },
  zoomLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.zoomLabelTooltip',
    defaultMessage:
      'Set how zoomed in the map is by default. Choose a value between 1 and 17, where 1 is fully zoomed out (the entire world is visible) and 17 is fully zoomed in (blocks and buildings are visible)',
  },
  editLayer: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.editLayer',
    defaultMessage: 'Edit layer',
  },
  currentCenterCoordinates: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.currentCenterCoordinates',
    defaultMessage: 'Current center coordinates',
  },
  currentZoomLevel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.currentZoomLevel',
    defaultMessage: 'Current zoom level',
  },
  mapCenterAndZoom: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapCenterAndZoom',
    defaultMessage: 'Map center & zoom',
  },
  deleteConfirmation: {
    id: 'app.components.admin.PostManager.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this layer?',
  },
  importError: {
    id: 'app.components.admin.PostManager.importError',
    defaultMessage: `The selected file could not be imported because it's not a valid GeoJSON file`,
  },
});
