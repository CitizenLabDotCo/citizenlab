import { Box, Text } from '@citizenlab/cl2-component-library';
import React from 'react';
import styled from 'styled-components';
import messages from '../../messages';
import TapHere from './TapImage.svg';
import { useIntl } from 'utils/cl-intl';

const OverlayContainer = styled(Box)`
  z-index: 1;
  position: absolute;
  height: 180px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type Props = {
  showMapOverlay: boolean;
  handleShowFullscreenMap: () => void;
};

const MapOverlay = ({ showMapOverlay, handleShowFullscreenMap }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <OverlayContainer
        background="black"
        style={{ opacity: showMapOverlay ? 0.6 : 0 }}
        onClick={handleShowFullscreenMap}
      />
      {showMapOverlay && (
        <OverlayContainer onClick={handleShowFullscreenMap}>
          <img src={TapHere} alt="Tap to access the map" />
          <Text color="white" style={{ fontWeight: 600 }}>
            {formatMessage(messages.tapToAddAPoint)}
          </Text>
        </OverlayContainer>
      )}
    </>
  );
};

export default MapOverlay;
