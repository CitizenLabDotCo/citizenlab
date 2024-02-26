import React, { memo, useCallback, useMemo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import LayerHoverLabel from './components/LayerHoverLabel';
import MapHelperOptions from './components/MapHelperOptions';

// hooks
import useLocalize from 'hooks/useLocalize';

// utils
import {
  changeCursorOnHover,
  createEsriFeatureLayers,
  createEsriGeoJsonLayers,
} from 'components/EsriMap/utils';

// types
import { IMapConfig } from 'api/map_config/types';

export interface Props {
  mapConfig: IMapConfig;
  projectId: string;
}

const IdeationConfigurationMap = memo<Props>(
  ({ mapConfig, projectId }: Props) => {
    const localize = useLocalize();
    const [mapView, setMapView] = React.useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = React.useState<string | null>(
      null
    );

    // Create layers from map config to add to Esri map
    const mapLayers = useMemo(() => {
      const layers = mapConfig.data.attributes.layers;
      if (layers && layers.length > 0) {
        // All layers are either of type Esri or GeoJSON, so we can check just the first layer
        if (layers[0]?.type === 'CustomMaps::GeojsonLayer') {
          return createEsriGeoJsonLayers(
            mapConfig.data.attributes.layers,
            localize
          );
        } else if (layers[0]?.type === 'CustomMaps::EsriFeatureLayer') {
          return createEsriFeatureLayers(
            mapConfig.data.attributes.layers,
            localize
          );
        }
      }
      return [];
    }, [localize, mapConfig?.data?.attributes?.layers]);

    const onMapInit = useCallback((esriMapView: MapView) => {
      // Save the esriMapView in state
      setMapView(esriMapView);
    }, []);

    const onHover = useCallback((event: any, esriMapView: MapView) => {
      // Change cursor when hovering over element
      changeCursorOnHover(event, esriMapView);

      esriMapView.hitTest(event).then((result) => {
        if (result.results.length > 0) {
          // Hovering over marker(s)
          const element = result.results[0];
          if (element.type === 'graphic') {
            // Set the hovered layer id
            setHoveredLayerId(element.layer['customParameters']?.layerId);
          }
        } else {
          setHoveredLayerId(null);
        }
      });
    }, []);

    return (
      <>
        <EsriMap
          initialData={{
            center: mapConfig.data.attributes.center_geojson,
            zoom: Number(mapConfig.data.attributes.zoom_level),
            showLayerVisibilityControl: true,
            showLegend: true,
            onInit: onMapInit,
            webMapId: mapConfig.data.attributes.esri_web_map_id,
          }}
          height={'700px'}
          layers={mapLayers}
          onHover={onHover}
        />
        <LayerHoverLabel
          layer={mapConfig.data.attributes.layers.find(
            (layer) => layer?.id === hoveredLayerId
          )}
        />
        <MapHelperOptions
          mapView={mapView}
          mapConfig={mapConfig}
          projectId={projectId}
        />
      </>
    );
  }
);

export default IdeationConfigurationMap;
