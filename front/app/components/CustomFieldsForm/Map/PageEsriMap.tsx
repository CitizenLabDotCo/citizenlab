import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IMapConfig } from 'api/map_config/types';

import EsriMap from 'components/EsriMap';

const PageEsriMap = ({
  currentPageNumber,
  mapConfig,
  mapLayers,
  draggableDivRef,
}: {
  currentPageNumber: number;
  mapConfig: IMapConfig | null | undefined;
  mapLayers: __esri.Layer[];
  draggableDivRef: React.RefObject<HTMLDivElement>;
}) => {
  const isMobileOrSmaller = useBreakpoint('phone');
  return (
    <Box
      id="map_page"
      w={isMobileOrSmaller ? '100%' : '60%'}
      minWidth="60%"
      h="100%"
      ref={draggableDivRef}
      key={`esri_map_${currentPageNumber}`}
    >
      <EsriMap
        layers={mapLayers}
        initialData={{
          showLegend: true,
          showLayerVisibilityControl: true,
          showLegendExpanded: true,
          showZoomControls: isMobileOrSmaller ? false : true,
          zoom: Number(mapConfig?.data.attributes.zoom_level),
          center: mapConfig?.data.attributes.center_geojson,
        }}
        webMapId={mapConfig?.data.attributes.esri_web_map_id}
        height="100%"
      />
    </Box>
  );
};

export default PageEsriMap;
