import React, { memo, useRef } from 'react';

// components
import EsriMap from 'components/EsriMap';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

// utils
import { getMapPinSymbol } from 'components/EsriMap/utils';

// hooks
import { useTheme } from 'styled-components';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

export interface Props {
  eventLocation?: GeoJSON.Point | null;
}

const LocationMap = memo<Props>(({ eventLocation }: Props) => {
  const theme = useTheme();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const locationPoint = useRef<GeoJSON.Point | null>(eventLocation || null);

  // Create point graphic for event location
  const pointGraphic = new Graphic({
    geometry: new Point({
      longitude: locationPoint?.current?.coordinates[0],
      latitude: locationPoint?.current?.coordinates[1],
    }),
    symbol: getMapPinSymbol(theme.colors.tenantPrimary),
  });

  return (
    <EsriMap
      center={eventLocation}
      height={isPhoneOrSmaller ? '180px' : '140px'}
      zoom={18}
      graphics={[pointGraphic]}
      showFullscreenOption={isPhoneOrSmaller ? false : true}
    />
  );
});

export default LocationMap;
