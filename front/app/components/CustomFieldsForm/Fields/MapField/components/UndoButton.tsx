import React, { RefObject, useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Button,
  Box,
  Tooltip,
  ButtonStyles,
  ButtonProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { isLineOrPolygonInput } from '../multiPointUtils';
import {
  getUserInputGraphicsLayer,
  getUserInputPoints,
  MapInputType,
} from '../utils';

import messages from './messages';

type UndoButtonProps = {
  mapView?: MapView | null;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  undoEnabled: boolean;
  inputType: MapInputType;
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
  width,
  height,
  iconColor,
  bgHoverColor,
  borderRadius,
  padding,
  iconSize,
}: UndoButtonProps & ButtonProps) => {
  const { formatMessage } = useIntl();
  const [disabled, setDisabled] = useState(true);

  const undoLatest = () => {
    // Update the form data
    const currentPoints = getUserInputPoints(mapView);
    handleMultiPointChange?.(currentPoints.slice(0, -1));

    // If removing final point, set the data to undefined & clear the map
    if (currentPoints.length === 1) {
      const userInputLayer = getUserInputGraphicsLayer(mapView);

      if (userInputLayer) {
        userInputLayer.removeAll();
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mapView?.map?.layers?.remove(userInputLayer);
        handleMultiPointChange?.(undefined);
      }
    }
  };

  useEffect(() => {
    setDisabled(!undoEnabled);
  }, [undoEnabled]);

  return (
    <Box ref={undoButtonRef}>
      {isLineOrPolygonInput(inputType) && (
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
              buttonStyle={buttonStyle || 'white'}
              opacityDisabled="0.6"
              disabled={disabled}
              text={buttonStyle ? formatMessage(messages.undo) : undefined}
              aria-label={formatMessage(messages.undoLastPoint)}
              width={width}
              height={height}
              iconColor={iconColor}
              bgHoverColor={bgHoverColor}
              borderRadius={borderRadius}
              padding={padding}
              iconSize={iconSize}
            />
          </div>
        </Tooltip>
      )}
    </Box>
  );
};

export default UndoButton;
