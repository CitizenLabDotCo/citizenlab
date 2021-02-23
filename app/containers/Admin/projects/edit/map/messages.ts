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
  supportArticle: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.supportArticle',
    defaultMessage: 'support article',
  },
  supportArticleUrl: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.supportArticleUrl',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/4910983-customize-your-project-map',
  },
  layersTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layersTooltip',
    defaultMessage:
      'We currently support GeoJSON files. Read the {supportArticle} for tips on how to convert and style map layers.',
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
      'All features in the layer will be styled with this color. This color will also overwrite any existing styling in your GeoJSON file.',
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
    defaultMessage: 'Default longitude',
  },
  centerLngLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLngLabelTooltip',
    defaultMessage:
      'The longitude of the default map center point. Accepts a value between -180 and 180.',
  },
  centerLatLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLatLabel',
    defaultMessage: 'Default latitude',
  },
  centerLatLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLatLabelTooltip',
    defaultMessage:
      'The latitude of the default map center point. Accepts a value between -90 and 90.',
  },
  zoomLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.zoomLabel',
    defaultMessage: 'Map zoom level',
  },
  zoomLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.zoomLabelTooltip',
    defaultMessage:
      'The default zoom level of the map. Accepts a value between 1 and 17, where 1 is fully zoomed out (the entire world is visible) and 17 is fully zoomed in (blocks and buildings are visible)',
  },
  editLayer: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.editLayer',
    defaultMessage: 'Edit layer',
  },
  mapCenterAndZoom: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapCenterAndZoom',
    defaultMessage: 'Map default center & zoom',
  },
  mapCenterAndZoomTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapCenterAndZoomTooltip',
    defaultMessage:
      'The default center point and zoom level of the map. Manually adjust the values below, or click on the {button} button in the top right corner of the map to save the current center point and zoom level of the map as the default values.',
  },
  deleteConfirmation: {
    id: 'app.components.admin.PostManager.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this layer?',
  },
  importError: {
    id: 'app.components.admin.PostManager.importError',
    defaultMessage: `The selected file could not be imported because it's not a valid GeoJSON file`,
  },
  goToDefaultMapView: {
    id: 'app.components.admin.PostManager.goToDefaultMapView',
    defaultMessage: `Pan & zoom to the default center point & zoom level`,
  },
  setAsDefaultMapView: {
    id: 'app.components.admin.PostManager.setAsDefaultMapView',
    defaultMessage: `Save the current center point & zoom level as the map defaults`,
  },
  currentLat: {
    id: 'app.components.admin.PostManager.currentLat',
    defaultMessage: `Center latitude`,
  },
  currentLng: {
    id: 'app.components.admin.PostManager.currentLng',
    defaultMessage: `Center longitude`,
  },
  currentZoomLevel: {
    id: 'app.components.admin.PostManager.currentZoomLevel',
    defaultMessage: `Zoom level`,
  },
  saved: {
    id: 'app.components.admin.PostManager.saved',
    defaultMessage: `Saved`,
  },
});
