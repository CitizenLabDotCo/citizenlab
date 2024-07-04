import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import TapHere from './TapImage.svg';

type Props = {
  showMapOverlay: boolean;
  handleShowFullscreenMap: () => void;
};

const MapOverlay = ({ showMapOverlay, handleShowFullscreenMap }: Props) => {
  const { formatMessage } = useIntl();

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
          <Text m="0px" pt="8px" color="white" style={{ fontWeight: 600 }}>
            {formatMessage(messages.tapToAddAPoint)}
          </Text>
        </Box>
      )}
    </>
  );
};

export default MapOverlay;
