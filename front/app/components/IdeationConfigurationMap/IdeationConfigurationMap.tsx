import React, { memo, useCallback, useMemo } from 'react';

import MapView from '@arcgis/core/views/MapView';

import EsriMap from 'components/EsriMap';
import {
  changeCursorOnHover,
  createEsriGeoJsonLayers,
} from 'components/EsriMap/utils';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

import LayerHoverLabel from './components/LayerHoverLabel';
import MapHelperOptions from './components/MapHelperOptions';

export interface Props {
  mapConfig: IMapConfig;
  projectId: string;
  setParentMapView: (mapView: MapView) => void;
}

const IdeationConfigurationMap = memo<Props>(
  ({ mapConfig, projectId, setParentMapView }: Props) => {
    const localize = useLocalize();
    const [mapView, setMapView] = React.useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = React.useState<string | null>(
      null
    );

    // Create GeoJSON layers to add to Esri map
    const geoJsonLayers = useMemo(() => {
      return createEsriGeoJsonLayers(
        mapConfig.data.attributes.layers,
        localize
      );
    }, [mapConfig, localize]);

    const onMapInit = useCallback(
      (esriMapView: MapView) => {
        // Save the esriMapView in state
        setMapView(esriMapView);
        setParentMapView(esriMapView);
      },
      [setParentMapView]
    );

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
          }}
          height={'700px'}
          layers={geoJsonLayers}
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
