import React, { memo, useRef } from 'react';

// components
import EsriMap from 'components/EsriMap';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';

// utils
import { getMapPinSymbol } from 'components/EsriMap/utils';

// types
import { SubmitState } from '../edit';

// hooks
import { useTheme } from 'styled-components';

export interface Props {
  mapHeight?: string;
  setSubmitState?: (state: SubmitState) => void;
  position?: GeoJSON.Point | null;
  setLocationPoint?: (locationPoint: GeoJSON.Point) => void;
}

const EventMap = memo<Props>(
  ({ position, mapHeight, setLocationPoint, setSubmitState }: Props) => {
    const theme = useTheme();
    const locationPoint = useRef<GeoJSON.Point | null>(position || null);

    // Create point graphic for event location
    const pointGraphic = new Graphic({
      geometry: new Point({
        longitude: locationPoint?.current?.coordinates[0],
        latitude: locationPoint?.current?.coordinates[1],
      }),
      symbol: getMapPinSymbol(theme.colors.tenantPrimary),
    });

    const onClick = (event: any, mapView: MapView) => {
      // Update the locationPoint ref
      locationPoint.current = {
        type: 'Point',
        coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
      };

      // Create a graphic and add the point and symbol to it
      const graphic = new Graphic({
        geometry: new Point({
          longitude: locationPoint.current.coordinates[0],
          latitude: locationPoint.current.coordinates[1],
        }),
        symbol: getMapPinSymbol(theme.colors.tenantPrimary),
      });

      // Add a pin to the clicked location and delete the old one
      mapView.graphics.removeAll();
      mapView.graphics.add(graphic);

      // Update the locationPoint and submitState in the parent form component
      setSubmitState && setSubmitState('enabled');
      setLocationPoint &&
        setLocationPoint({
          type: 'Point',
          coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
        });
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
  }
);

export default EventMap;
