import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import CloseIconButton from 'components/UI/CloseIconButton';
import FullscreenModal from 'components/UI/FullscreenModal';

type Props = {
  setShowMapOverlay: (show: boolean) => void;
};

const MapInputOverlay = ({ setShowMapOverlay }: Props) => {
  return (
    <FullscreenModal
      opened={true}
      close={() => {
        setShowMapOverlay(false);
      }}
      zIndex={999999}
    >
      <Box>
        <CloseIconButton
          onClick={() => {
            setShowMapOverlay(false);
          }}
        />
        Fullscreen modal
      </Box>
    </FullscreenModal>
  );
};

export default MapInputOverlay;
