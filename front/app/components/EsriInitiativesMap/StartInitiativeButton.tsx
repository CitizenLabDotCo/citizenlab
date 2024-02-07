import React from 'react';
import { createPortal } from 'react-dom';

// components
import { Button } from '@citizenlab/cl2-component-library';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  modalPortalElement: HTMLDivElement;
  onClick: () => void;
};

const StartInitiativeButton = ({ modalPortalElement, onClick }: Props) => {
  const { formatMessage } = useIntl();
  if (!modalPortalElement) return null;

  return createPortal(
    <Button icon="arrow-right" iconPos="right" onClick={onClick}>
      {formatMessage(messages.startAProposal)}
    </Button>,
    modalPortalElement
  );
};

export default StartInitiativeButton;
