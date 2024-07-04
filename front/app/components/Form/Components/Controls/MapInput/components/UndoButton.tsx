import React, { useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Button, Box, colors } from '@citizenlab/cl2-component-library';

import { getUserInputPoints } from '../utils';

type UndoButtonProps = {
  id: string;
  mapView?: MapView | null;
  handleMultiPointChange?: (points: GeoJSON.Point[] | undefined) => void;
  undoEnabled: boolean;
};
const UndoButton = ({
  id,
  handleMultiPointChange,
  mapView,
  undoEnabled,
}: UndoButtonProps) => {
  const [disabled, setDisabled] = useState(true);

  const undoLatest = () => {
    // Update the form data
    const currentPoints = getUserInputPoints(mapView);
    handleMultiPointChange?.(currentPoints.slice(0, -1));

    // If removing final point, set the data to undefined & clear the map
    if (currentPoints.length === 1) {
      handleMultiPointChange?.(undefined);
      mapView?.graphics.removeAll();
    }
  };

  useEffect(() => {
    setDisabled(!undoEnabled);
  }, [undoEnabled]);

  return (
    <Box id={`undo-button-${id}`}>
      <Button
        icon="undo"
        onClick={() => {
          undoLatest();
        }}
        buttonStyle="white"
        iconColor={colors.coolGrey500}
        bgHoverColor={colors.grey100}
        opacityDisabled="0.6"
        borderRadius="0px"
        padding="7px"
        boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
        disabled={disabled}
      />
    </Box>
  );
};

export default UndoButton;
