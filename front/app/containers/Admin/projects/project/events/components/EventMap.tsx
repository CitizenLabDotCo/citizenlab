import React, { memo, useRef, useMemo, useCallback } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import { useTheme } from 'styled-components';

import EsriMap from 'components/EsriMap';
import { getMapPinSymbol } from 'components/EsriMap/utils';

import { SubmitState } from '../types';

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

    const graphics = useMemo(() => {
      // Create point graphic for event location
      const pointGraphic = new Graphic({
        geometry: new Point({
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          longitude: locationPoint?.current?.coordinates[0],
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          latitude: locationPoint?.current?.coordinates[1],
        }),
        symbol: getMapPinSymbol({ color: theme.colors.tenantPrimary }),
      });

      return [pointGraphic];
    }, [theme.colors.tenantPrimary]);

    const onClick = useCallback(
      (event: any, mapView: MapView) => {
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
          symbol: getMapPinSymbol({ color: theme.colors.tenantPrimary }),
        });

        // Add a pin to the clicked location and delete the old one
        mapView.graphics.removeAll();
        mapView.graphics.add(graphic);

        // Update the locationPoint and submitState in the parent form component
        setSubmitState?.('enabled');

        setLocationPoint?.({
          type: 'Point',
          coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
        });
      },
      [setLocationPoint, setSubmitState, theme.colors.tenantPrimary]
    );

    return (
      <EsriMap
        initialData={{
          center: position,
          zoom: 18,
        }}
        onClick={onClick}
        graphics={graphics}
        height={mapHeight}
      />
    );
  }
);

export default EventMap;
