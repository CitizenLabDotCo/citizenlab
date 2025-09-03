import React, { memo, useMemo, useRef } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import EsriMap from 'components/EsriMap';
import { getMapPinSymbol } from 'components/EsriMap/utils';

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
