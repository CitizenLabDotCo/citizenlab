import { Button } from '@citizenlab/cl2-component-library';
import React from 'react';
import { createPortal } from 'react-dom';

type Props = {
  modalPortalElement: HTMLDivElement;
  onClick: () => void;
};

const StartProposalButton = ({ modalPortalElement, onClick }: Props) => {
  if (!modalPortalElement) return null;

  return createPortal(
    <Button icon="arrow-right" iconPos="right" onClick={onClick}>
      Start a proposal
    </Button>,
    modalPortalElement
  );
};

export default StartProposalButton;
