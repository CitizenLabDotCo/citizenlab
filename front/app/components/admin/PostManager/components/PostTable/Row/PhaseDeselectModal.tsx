import React from 'react';

// components
import WarningModal from 'components/WarningModal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PhaseDeselectModal = ({ open, isLoading, onClose, onConfirm }: Props) => {
  return (
    <WarningModal
      open={open}
      isLoading={isLoading}
      title={<FormattedMessage {...messages.theVotesAssociated} />}
      explanation={<FormattedMessage {...messages.youAreTrying} />}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default PhaseDeselectModal;
