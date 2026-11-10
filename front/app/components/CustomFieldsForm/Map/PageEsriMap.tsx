import React from 'react';

import {
  Box,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IMapConfig } from 'api/map_config/types';

import EsriMap from 'components/EsriMap';

const PageEsriMap = ({
  currentPageIndex,
  mapConfig,
  mapLayers,
  draggableDivRef,
  variant = 'side',
}: {
  currentPageIndex: number;
  mapConfig: IMapConfig | null | undefined;
  mapLayers: __esri.Layer[];
  draggableDivRef?: React.RefObject<HTMLDivElement>;
  // 'side' fills the left of a classic form card; 'block' fills whatever
  // box it's put in (surveys).
  variant?: 'side' | 'block';
}) => {
  const isMobileOrSmaller = useBreakpoint('phone');
  return (
    <Box
      // Its presence switches the ideation forms to their map layout; the
      // survey's block map mustn't.
      id={variant === 'side' ? 'map_page' : undefined}
      w={isMobileOrSmaller || variant === 'block' ? '100%' : '60%'}
      minWidth={variant === 'side' ? '60%' : undefined}
      h="100%"
      borderRadius={
        variant === 'block' ? stylingConsts.borderRadius : undefined
      }
      overflow={variant === 'block' ? 'hidden' : undefined}
      ref={draggableDivRef}
      key={`esri_map_${currentPageIndex}`}
      data-cy={variant === 'block' ? 'e2e-survey-page-map' : undefined}
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
        esriFeaturePopupsEnabled
        height="100%"
      />
    </Box>
  );
};

export default PageEsriMap;
