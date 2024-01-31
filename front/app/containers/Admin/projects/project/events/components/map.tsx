import React from 'react';

// components
import EsriMap from 'components/EsriMap';

// esri
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

// utils
import { getMapPinSymbol } from 'components/EsriMap/utils';

// types
import { SubmitState } from '../edit';

// hooks
import { useTheme } from 'styled-components';
export interface Props {
  mapHeight?: string;
  setSubmitState?: (state: SubmitState) => void;
  position?: GeoJSON.Point;
  setLocationPoint?: (locationPoint: GeoJSON.Point) => void;
}

const MapComponent = ({
  position,
  mapHeight,
  setLocationPoint,
  setSubmitState,
}: Props) => {
  const theme = useTheme();

  // Create point graphic for event location
  const pointGraphic = new Graphic({
    geometry: new Point({
      longitude: position?.coordinates[0],
      latitude: position?.coordinates[1],
    }),
    symbol: getMapPinSymbol(theme.colors.tenantPrimary),
  });

  const onClick = (event: any) => {
    setSubmitState && setSubmitState('enabled');
    setLocationPoint &&
      setLocationPoint({
        type: 'Point',
        coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
      } as GeoJSON.Point);
  };

  return (
    <EsriMap
      center={position}
      height={mapHeight}
      zoom={18}
      graphics={[pointGraphic]}
      onClick={onClick}
    />
  );
};

export default MapComponent;
