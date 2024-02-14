import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

// types
import { IMapLayerAttributes } from 'modules/commercial/custom_maps/api/map_layers/types';

// hooks
import useLocalize from 'hooks/useLocalize';
import { hexToRGBA } from 'utils/helperUtils';

type Props = {
  layer: IMapLayerAttributes | undefined;
};

const LayerHoverLabel = ({ layer }: Props) => {
  const localize = useLocalize();
  const layerColor = layer?.geojson?.features[0]?.properties?.fill;
  const layerTooltip = localize(
    layer?.geojson?.features[0].properties?.tooltipContent
  );

  if (layerTooltip) {
    return (
      <Box
        display="flex"
        zIndex="1000"
        width="100%"
        position="absolute"
        top="0"
        mt="20px"
        justifyContent="center"
      >
        <Box
          width="fit-content"
          maxWidth="240px"
          background={hexToRGBA(colors.white, 0.8)}
          display="flex"
          borderRadius="3px"
          border={`1px solid ${layerColor || colors.grey800}`}
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
