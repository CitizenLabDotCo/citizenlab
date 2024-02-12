import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import InitiativePreview from './InitiativePreview';
import CloseIconButton from 'components/UI/CloseIconButton';
import styled from 'styled-components';

type Props = {
  selectedInitiative?: string | null;
  setSelectedInitiative: React.Dispatch<React.SetStateAction<string | null>>;
};

const StyledCloseButton = styled(CloseIconButton)`
  width: 100%;
  justify-content: flex-end;
  padding-top: 8px;
  padding-right: 8px;
`;

const InitiativeInformationOverlay = ({
  selectedInitiative,
  setSelectedInitiative,
}: Props) => {
  if (!selectedInitiative) return null;

  return (
    <Box
      zIndex="1000"
      background="white"
      width="100%"
      position="absolute"
      top="0"
    >
      <Box width="100%" ml="auto">
        <StyledCloseButton onClick={() => setSelectedInitiative(null)} />
      </Box>
      <InitiativePreview initiativeId={selectedInitiative} />
    </Box>
  );
};

export default InitiativeInformationOverlay;
