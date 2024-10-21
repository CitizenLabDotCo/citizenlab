import React, { memo, useCallback, useMemo } from 'react';

import MapView from '@arcgis/core/views/MapView';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

// utils
import EsriMap from 'components/EsriMap';
import { changeCursorOnHover, parseLayers } from 'components/EsriMap/utils';

import LayerHoverLabel from './components/LayerHoverLabel';
import MapHelperOptions from './components/MapHelperOptions';

export interface Props {
  mapConfig: IMapConfig;
  setParentMapView: (mapView: MapView) => void;
}

const ConfigurationMap = memo<Props>(
  ({ mapConfig, setParentMapView }: Props) => {
    const localize = useLocalize();
    const [mapView, setMapView] = React.useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = React.useState<string | null>(
      null
    );

    // Create layers from map config to add to Esri map
    const mapLayers = useMemo(() => {
      return parseLayers(mapConfig, localize);
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
          webMapId={mapConfig.data.attributes.esri_web_map_id}
          height={'700px'}
          layers={mapLayers}
          onHover={onHover}
        />
        <LayerHoverLabel
          layer={mapConfig.data.attributes.layers.find(
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (layer) => layer?.id === hoveredLayerId
          )}
        />
        <MapHelperOptions mapView={mapView} mapConfig={mapConfig} />
      </>
    );
  }
);

export default ConfigurationMap;
