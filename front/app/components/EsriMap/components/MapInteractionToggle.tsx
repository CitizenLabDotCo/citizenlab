import React from 'react';

import {
  Box,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

// MapInteractionToggle
// Description: Lets users switch a map between drawing their answer and
// exploring web map features (clicking them opens their ArcGIS-configured
// popups). Rendered into a ref so it can be added to the map UI via
// mapView.ui.add().
export type MapInteractionMode = 'draw' | 'explore';

type Props = {
  toggleRef?: React.RefObject<HTMLDivElement>;
  mode: MapInteractionMode;
  onModeChange: (mode: MapInteractionMode) => void;
};

const MapInteractionToggle = ({ toggleRef, mode, onModeChange }: Props) => {
  const { formatMessage } = useIntl();

  const modeButton = (
    buttonMode: MapInteractionMode,
    label: string,
    tooltip: string
  ) => {
    const selected = mode === buttonMode;
    return (
      <Tooltip maxWidth="250px" placement="bottom" content={tooltip}>
        <div>
          <Button
            icon={buttonMode === 'draw' ? 'pen' : 'info-outline'}
            buttonStyle="white"
            bgColor={selected ? colors.primary : undefined}
            textColor={selected ? colors.white : colors.coolGrey600}
            iconColor={selected ? colors.white : colors.coolGrey500}
            bgHoverColor={selected ? colors.primary : colors.grey100}
            borderRadius="0px"
            padding="4px 12px"
            height="32px"
            iconSize="16px"
            fontSize="14px"
            onClick={() => onModeChange(buttonMode)}
            ariaPressed={selected}
          >
            {label}
          </Button>
        </div>
      </Tooltip>
    );
  };

  return (
    <Box
      ref={toggleRef}
      display="flex"
      background={colors.white}
      role="group"
      aria-label={formatMessage(messages.mapInteractionToggleAriaLabel)}
    >
      {modeButton(
        'draw',
        formatMessage(messages.drawOnMap),
        formatMessage(messages.drawOnMapTooltip)
      )}
      {modeButton(
        'explore',
        formatMessage(messages.exploreMap),
        formatMessage(messages.exploreMapTooltip)
      )}
    </Box>
  );
};

export default MapInteractionToggle;
