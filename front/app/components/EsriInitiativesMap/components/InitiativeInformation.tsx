import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Box } from '@citizenlab/cl2-component-library';
import eventEmitter from 'utils/eventEmitter';
import InitiativePreview from './InitiativePreview';
import CloseIconButton from 'components/UI/CloseIconButton';
import styled from 'styled-components';

type Props = {
  modalPortalElement: HTMLDivElement;
};

const StyledCloseButton = styled(CloseIconButton)`
  width: 100%;
  justify-content: flex-end;
  padding-top: 8px;
  padding-right: 8px;
`;

const InitiativeInformation = ({ modalPortalElement }: Props) => {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<
    string | null
  >(null);

  // Listen for initiative selection event and set selected ID
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('initiativeSelectedEvent')
      .subscribe(({ eventValue }) => {
        setSelectedInitiativeId(eventValue as string);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!modalPortalElement) return null;
  if (!selectedInitiativeId) return null;

  return createPortal(
    <Box background="white" width="100%">
      <Box width="100%" ml="auto">
        <StyledCloseButton onClick={() => setSelectedInitiativeId(null)} />
      </Box>
      <InitiativePreview initiativeId={selectedInitiativeId} />
    </Box>,
    modalPortalElement
  );
};

export default InitiativeInformation;
