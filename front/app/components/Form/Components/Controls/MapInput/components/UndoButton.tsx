import React, { RefObject, useEffect, useState } from 'react';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {
  Button,
  Box,
  colors,
  Tooltip,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { getUserInputPoints } from '../utils';

import messages from './messages';

type UndoButtonProps = {
  mapView?: MapView | null;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  undoEnabled: boolean;
  inputType: 'point' | 'line' | 'polygon';
  undoButtonRef?: RefObject<HTMLDivElement>;
  buttonStyle?: ButtonStyles;
};
const UndoButton = ({
  undoButtonRef,
  handleMultiPointChange,
  mapView,
  undoEnabled,
  inputType,
  buttonStyle,
}: UndoButtonProps) => {
  const { formatMessage } = useIntl();
  const [disabled, setDisabled] = useState(true);

  const undoLatest = () => {
    // Update the form data
    const currentPoints = getUserInputPoints(mapView);
    handleMultiPointChange?.(currentPoints.slice(0, -1));

    // If removing final point, set the data to undefined & clear the map
    if (currentPoints.length === 1) {
      const userInputLayer = mapView?.map.layers.find(
        (layer) => layer.title === 'User Input'
      ) as GraphicsLayer;
      userInputLayer.removeAll();

      mapView?.map.layers.remove(userInputLayer);

      handleMultiPointChange?.(undefined);
    }
  };

  useEffect(() => {
    setDisabled(!undoEnabled);
  }, [undoEnabled]);

  return (
    <Box ref={undoButtonRef}>
      {(inputType === 'line' || inputType === 'polygon') && (
        <Tooltip
          maxWidth="250px"
          placement={buttonStyle ? 'top' : 'right'}
          content={formatMessage(messages.undo)}
          hideOnClick={true}
        >
          <div>
            <Button
              icon="undo"
              onClick={() => {
                undoLatest();
              }}
              width={buttonStyle ? undefined : '32px'}
              height={buttonStyle ? undefined : '32px'}
              buttonStyle={buttonStyle || 'white'}
              iconColor={buttonStyle ? undefined : colors.coolGrey500}
              bgHoverColor={buttonStyle ? undefined : colors.grey100}
              opacityDisabled="0.6"
              borderRadius={buttonStyle ? undefined : '0px'}
              padding={buttonStyle ? undefined : '7px'}
              iconSize={buttonStyle ? undefined : '20px'}
              boxShadow={
                buttonStyle ? undefined : '0px 2px 2px rgba(0, 0, 0, 0.2)'
              }
              disabled={disabled}
              text={buttonStyle ? formatMessage(messages.undo) : undefined}
              aria-label={formatMessage(messages.undoLastPoint)}
            />
          </div>
        </Tooltip>
      )}
    </Box>
  );
};

export default UndoButton;
