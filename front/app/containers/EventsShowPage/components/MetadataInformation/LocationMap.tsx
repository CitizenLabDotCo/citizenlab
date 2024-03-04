import React, { memo, useMemo, useRef } from 'react';

import EsriMap from 'components/EsriMap';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

import { getMapPinSymbol } from 'components/EsriMap/utils';

import { useTheme } from 'styled-components';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

export interface Props {
  eventLocation?: GeoJSON.Point | null;
}

const LocationMap = memo<Props>(({ eventLocation }: Props) => {
  const theme = useTheme();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const locationPoint = useRef<GeoJSON.Point | null>(eventLocation || null);

  const graphics = useMemo(() => {
    // Create point graphic for event location
    const pointGraphic = new Graphic({
      geometry: new Point({
        longitude: locationPoint?.current?.coordinates[0],
        latitude: locationPoint?.current?.coordinates[1],
      }),
      symbol: getMapPinSymbol({ color: theme.colors.tenantPrimary }),
    });

    return [pointGraphic];
  }, [theme.colors.tenantPrimary]);

  return (
    <EsriMap
      initialData={{
        center: eventLocation,
        zoom: 18,
        showFullscreenOption: isPhoneOrSmaller ? false : true,
      }}
      graphics={graphics}
      height={isPhoneOrSmaller ? '180px' : '140px'}
    />
  );
});

export default LocationMap;
