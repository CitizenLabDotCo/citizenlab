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
  saveZoom: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.saveZoom',
    defaultMessage: 'Save zoom',
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
  unnamedLayer: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.unnamedLayer',
    defaultMessage: 'Unnamed layer',
  },
  mapConfigurationTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapConfigurationTitle',
    defaultMessage: 'Map configuration',
  },
  mapConfigurationDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapConfigurationDescription',
    defaultMessage:
      'Customize the map view, including uploading and styling map layers and setting the map center and zoom level.',
  },
  mapLocationWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapLocationWarning',
    defaultMessage:
      "The map configuration is currently shared across phases, you can't create different map configurations per phase.",
  },
  supportArticle: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.supportArticle',
    defaultMessage: 'support article',
  },
  supportArticleUrl3: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.supportArticleUrl3',
    defaultMessage:
      'https://support.govocal.com/en/articles/527600-collecting-input-and-feedback-list-and-map-view',
  },
  layersTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.layersTooltip',
    defaultMessage:
      'We currently support GeoJSON files and importing Feature Layers and Web Maps from ArcGIS Online. Read the {supportArticle} for tips on how to add, convert and style map layers.',
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
  lngLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.lngLabel',
    defaultMessage: 'Default longitude',
  },
  centerLngLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.centerLngLabelTooltip',
    defaultMessage:
      'The longitude of the default map center point. Accepts a value between -180 and 180.',
  },
  latLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.latLabel',
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
    defaultMessage: 'Map default center and zoom',
  },
  mapCenterAndZoomTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.MapTab.mapCenterAndZoomTooltip2',
    defaultMessage:
      'The default center point and zoom level of the map. Manually adjust the values below, or click on the {button} button in the bottom left corner of the map to save the current center point and zoom level of the map as the default values.',
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
    defaultMessage: `Pan and zoom to the default center point and zoom level`,
  },
  setAsDefaultMapView: {
    id: 'app.components.admin.PostManager.setAsDefaultMapView',
    defaultMessage: `Save the current center point and zoom level as the map defaults`,
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
  mapData: {
    id: 'app.components.admin.PostManager.mapData',
    defaultMessage: 'Map data',
  },
  importEsriWebMap: {
    id: 'app.components.admin.PostManager.importEsriWebMap',
    defaultMessage: 'Import Esri Web Map',
  },
  importEsriFeatureLayer: {
    id: 'app.components.admin.PostManager.importEsriFeatureLayer',
    defaultMessage: 'Import Esri Feature Layer',
  },
  addFeatureLayer: {
    id: 'app.components.admin.PostManager.addFeatureLayer',
    defaultMessage: 'Add feature layer',
  },
  addFeatureLayerTooltip: {
    id: 'app.components.admin.PostManager.addFeatureLayerTooltip',
    defaultMessage: 'Add a new feature layer to the map',
  },
  addFeatureLayerInstruction: {
    id: 'app.components.admin.PostManager.addFeatureLayerInstruction',
    defaultMessage:
      'Copy the URL of the feature layer hosted on ArcGIS Online and paste it in the input below:',
  },
  cancel2: {
    id: 'app.components.admin.PostManager.cancel2',
    defaultMessage: 'Cancel',
  },
  import2: {
    id: 'app.components.admin.PostManager.import2',
    defaultMessage: 'Import',
  },
  authenticationError: {
    id: 'app.components.admin.PostManager.authenticationError',
    defaultMessage:
      'An authentication error occured while trying to fetch this layer. Please check the URL and that your Esri API key has access to this layer.',
  },
  generalApiError: {
    id: 'app.components.admin.PostManager.generalApiError2',
    defaultMessage:
      'An error occured while trying to fetch this item. Please check that the URL or Portal ID is correct and you have access to this item.',
  },
  defaultEsriError: {
    id: 'app.components.admin.PostManager.defaultEsriError',
    defaultMessage:
      'An error occured while trying to fetch this layer. Please check your network connect and that the URL is correct.',
  },
  esriSideError: {
    id: 'app.components.admin.PostManager.esriSideError',
    defaultMessage:
      'An error occured on the ArcGIS application. Please wait a few minutes and try again later.',
  },
  layerAdded: {
    id: 'app.components.admin.PostManager.layerAdded',
    defaultMessage: 'Layer added successfully',
  },
  featureLayerTooltop: {
    id: 'app.components.admin.PostManager.featureLayerTooltop',
    defaultMessage:
      'You can find the Feature Layer URL on the right hand side of the item page on ArcGIS Online.',
  },
  webMapRemoveGeojsonTooltip: {
    id: 'app.components.admin.PostManager.webMapRemoveGeojsonTooltip',
    defaultMessage:
      'You may only upload map data as either GeoJSON layers or importing from ArcGIS Online. Please remove any current GeoJSON layers if you wish to connect a Web Map.',
  },
  featureLayerRemoveGeojsonTooltip: {
    id: 'app.components.admin.PostManager.featureLayerRemoveGeojsonTooltip',
    defaultMessage:
      'You may only upload map data as either GeoJSON layers or importing from ArcGIS Online. Please remove any current GeoJSON layers if you wish to add a Feature Layer.',
  },
  esriAddOnFeatureTooltip: {
    id: 'app.components.admin.PostManager.esriAddOnFeatureTooltip',
    defaultMessage:
      'Importing data from Esri ArcGIS Online is an add-on feature. Talk to your GS manager to unlock it.',
  },
  webMapAlreadyExists: {
    id: 'app.components.admin.PostManager.webMapAlreadyExists',
    defaultMessage:
      'You can only add one Web Map at a time. Remove the current one to import a different one.',
  },
  geojsonRemoveEsriTooltip: {
    id: 'app.components.admin.PostManager.geojsonRemoveEsriTooltip2',
    defaultMessage:
      'You may only upload map data as either GeoJSON layers or importing from ArcGIS Online. Please remove any ArcGIS data if you wish to upload a GeoJSON layer.',
  },
  addWebMap: {
    id: 'app.components.admin.PostManager.addWebMap',
    defaultMessage: 'Add Web Map',
  },
  webMapTooltip: {
    id: 'app.components.admin.PostManager.webMapTooltip',
    defaultMessage:
      'You can find the Web Map portal ID on your ArcGIS Online item page, on the right hand side.',
  },
  addWebMapInstruction: {
    id: 'app.components.admin.PostManager.addWebMapInstruction',
    defaultMessage:
      'Copy the portal ID of your Web Map from ArcGIS Online and paste it in the input below:',
  },
  esriWebMap: {
    id: 'app.components.admin.PostManager.esriWebMap',
    defaultMessage: 'Esri Web Map',
  },
});
