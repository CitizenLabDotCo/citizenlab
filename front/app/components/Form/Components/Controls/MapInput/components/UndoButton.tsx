import React, { RefObject, useEffect, useState } from 'react';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {
  Button,
  Box,
  colors,
  Tooltip,
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
};
const UndoButton = ({
  undoButtonRef,
  handleMultiPointChange,
  mapView,
  undoEnabled,
  inputType,
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
          placement="right"
          content={formatMessage(messages.undo)}
          hideOnClick={true}
        >
          <div>
            <Button
              icon="undo"
              onClick={() => {
                undoLatest();
              }}
              width="32px"
              height="32px"
              buttonStyle="white"
              iconColor={colors.coolGrey500}
              bgHoverColor={colors.grey100}
              opacityDisabled="0.6"
              borderRadius="0px"
              padding="7px"
              iconSize="20px"
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
              disabled={disabled}
              aria-label={formatMessage(messages.undo)}
            />
          </div>
        </Tooltip>
      )}
    </Box>
  );
};

export default UndoButton;
