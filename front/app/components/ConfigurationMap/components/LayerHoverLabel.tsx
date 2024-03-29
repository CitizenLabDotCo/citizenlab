import React from 'react';

import {
  Box,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IMapLayerAttributes } from 'api/map_layers/types';

import useLocalize from 'hooks/useLocalize';

type Props = {
  layer: IMapLayerAttributes | undefined;
};

const LayerHoverLabel = ({ layer }: Props) => {
  const localize = useLocalize();
  const isTabletOrSmaller = useBreakpoint('tablet');

  const layerTooltip = localize(
    layer?.geojson?.features[0].properties?.tooltipContent
  );

  if (layerTooltip && !isTabletOrSmaller) {
    return (
      <Box
        display="flex"
        zIndex="1000"
        width="100%"
        position="absolute"
        bottom="0"
        mb="28px"
        justifyContent="center"
      >
        <Box
          width="fit-content"
          maxWidth="280px"
          background={colors.white}
          padding="4px"
          display="flex"
          borderRadius="3px"
        >
          <Text
            color={'grey800'}
            textAlign="center"
            py="4px"
            px="8px"
            m="0px"
            fontSize="xs"
          >
            {layerTooltip}
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};

export default LayerHoverLabel;
