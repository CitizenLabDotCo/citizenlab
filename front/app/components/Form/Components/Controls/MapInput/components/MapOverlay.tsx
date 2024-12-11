import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { MapInputType } from '../utils';

import TapHere from './TapImage.svg';

type Props = {
  showMapOverlay: boolean;
  handleShowFullscreenMap: () => void;
  inputType: MapInputType;
};

const MapOverlay = ({
  showMapOverlay,
  handleShowFullscreenMap,
  inputType,
}: Props) => {
  const { formatMessage } = useIntl();

  const getOverlayText = () => {
    switch (inputType) {
      case 'point':
        return formatMessage(messages.tapToAddAPoint);
      case 'line':
        return formatMessage(messages.tapToAddALine);
      case 'polygon':
        return formatMessage(messages.tapToAddAnArea);
      default:
        return '';
    }
  };
  return (
    <>
      <Box
        background="black"
        style={{ opacity: showMapOverlay ? 0.6 : 0 }}
        onClick={handleShowFullscreenMap}
        zIndex="1"
        position="absolute"
        height="180px"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      />
      {showMapOverlay && (
        <Box
          onClick={handleShowFullscreenMap}
          zIndex="1"
          position="absolute"
          height="180px"
          width="100%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <img src={TapHere} alt="Tap to access the map" />
          <Text m="0px" pt="8px" color="white" fontWeight="semi-bold">
            {getOverlayText()}
          </Text>
        </Box>
      )}
    </>
  );
};

export default MapOverlay;
