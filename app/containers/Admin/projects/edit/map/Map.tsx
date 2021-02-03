require('leaflet-simplestyle');

import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Map
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import * as gjv from 'geojson-validation';

delete L.Icon.Default.prototype['_getIconUrl'];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

// components
import EditLayer from './EditLayer';

// hooks
import useMapConfig from 'hooks/useMapConfig';

// services
import {
  createProjectMapLayer,
  deleteProjectMapLayer,
} from 'services/mapLayers';

// i18n
import T from 'components/T';

// styling
import styled from 'styled-components';

const Container = styled.div``;

const MapContainer = styled.div`
  width: 500px;
  height: 500px;
`;

const Layers = styled.div`
  display: flex;
  flex-direction: column;
`;

const Layer = styled.div`
  display: flex;
`;

interface Props {
  projectId: string;
  className?: string;
}

const Map = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

  const [map, setMap] = useState<L.Map | null>(null);
  const [layer, setLayer] = useState<L.GeoJSON | null>(null);
  const [editedMapLayerId, setEditedMapLayerId] = useState<string | null>(null);

  const mapConfigId = !isNilOrError(mapConfig) ? mapConfig.id : null;

  useEffect(() => {
    if (!map) {
      const map = L.map('mapid').setView([50.869189, 4.725238], 16);

      L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
        {
          subdomains: ['a', 'b', 'c'],
          maxZoom: 20,
        }
      ).addTo(map);

      setLayer(
        L.geoJSON(undefined, {
          useSimpleStyle: true,
          useMakiMarkers: true,
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent);
            }

            if (feature.properties && feature.properties.tooltipContent) {
              layer.bindTooltip(feature.properties.tooltipContent);
            }
          },
        } as any).addTo(map)
      );

      setMap(map);
    }
  }, [map, layer]);

  useEffect(() => {
    layer?.clearLayers();

    if (!isNilOrError(mapConfig)) {
      mapConfig?.attributes?.layers?.forEach(({ geojson }) => {
        if (geojson) {
          layer?.addData(geojson);
        }
      });
    }
  }, [mapConfig]);

  const handleChange = (event: any) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    event.target.value = null;
    fileReader.onload = (event: any) => {
      const geojson = JSON.parse(event.target.result);

      if (mapConfigId && gjv.valid(geojson)) {
        createProjectMapLayer(projectId, {
          geojson,
          id: mapConfigId,
          title_multiloc: {
            en: `Unnamed layer ${Date.now()}`,
          },
          default_enabled: true,
        });
      }
    };
  };

  const removeLayer = (mapLayerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    deleteProjectMapLayer(projectId, mapLayerId);
  };

  const editLayer = (mapLayerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    setEditedMapLayerId(mapLayerId);
  };

  const stopEditing = () => {
    setEditedMapLayerId(null);
  };

  return (
    <Container className={className || ''}>
      <input type="file" onChange={handleChange} />
      <MapContainer id="mapid"></MapContainer>
      {!isNilOrError(mapConfig) && !editedMapLayerId && (
        <Layers>
          {mapConfig?.attributes?.layers?.map((mapLayer, index) => (
            <Layer key={index}>
              <div>
                <T value={mapLayer.title_multiloc} />
              </div>
              <button onClick={removeLayer(mapLayer.id)}>Remove</button>
              <button onClick={editLayer(mapLayer.id)}>Edit</button>
            </Layer>
          ))}
        </Layers>
      )}
      {editedMapLayerId && (
        <EditLayer
          projectId={projectId}
          mapLayerId={editedMapLayerId}
          onClose={stopEditing}
        />
      )}
    </Container>
  );
});

export default Map;
