import React from 'react';
import { createPortal } from 'react-dom';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';

type Props = {
  modalPortalElement: HTMLDivElement;
  selectedProposalId: string | null;
  onClick: () => void;
};

const ProposalInformation = ({
  modalPortalElement,
  selectedProposalId,
  onClick,
}: Props) => {
  if (!modalPortalElement) return null;

  console.log('ProposalInformation ID: ', selectedProposalId);

  return createPortal(
    <Box background="white" p="16px">
      More info for Proposal ID: {selectedProposalId}
      <Button icon="arrow-right" iconPos="right" onClick={onClick}>
        Temp button
      </Button>
    </Box>,
    modalPortalElement
  );
};

export default ProposalInformation;
