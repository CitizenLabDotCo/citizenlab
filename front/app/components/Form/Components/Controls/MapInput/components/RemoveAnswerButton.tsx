import React from 'react';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  mapView?: MapView | null;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
};
const RemoveAnswerButton = ({ mapView, handleMultiPointChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" justifyContent="center" mt="12px">
      <Button
        icon="close"
        buttonStyle="secondary"
        p="4px"
        px="12px"
        onClick={() => {
          // Clear user graphics from map view
          const userInputLayer = mapView?.map.layers.find((layer) => {
            return layer.title === 'User Input';
          }) as GraphicsLayer;
          userInputLayer?.removeAll();
          // Clear data
          handleMultiPointChange && handleMultiPointChange(undefined);
        }}
        text={formatMessage(messages.removeAnswer)}
      />
    </Box>
  );
};

export default RemoveAnswerButton;
