import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import { Box } from '@citizenlab/cl2-component-library';
import BinInputs from './BinInputs';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { updateLowerBound, updateUpperBound } from './utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export type Bins = (number| null)[];

// TODO delete this when real data is available
export const getDummyBins = (): Bins => [
  18, 25, 35, 45, 55, 65, null
]

const BinModal = ({ open, onClose }: Props) => {
  const [bins, setBins] = useState(getDummyBins());

  const handleUpdateLowerBound = (binIndex: number, newValue: number | null) => {
    setBins((bins) => updateLowerBound(bins, binIndex, newValue));
  };

  const handleUpdateUpperBound = (newValue: number | null) => {
    setBins((bins) => updateUpperBound(bins, newValue));
  };

  return (
    <Modal
      opened={open}
      close={onClose}
      width="70%"
      header={
        <Box color={colors.adminTextColor} style={{ fontWeight: 700 }}>
          <FormattedMessage {...messages.ageGroups} />
        </Box>
      }
    >
      <Box p="28px">
        <FormattedMessage {...messages.modalDescription} />
        <BinInputs
          bins={bins}
          onUpdateLowerBound={handleUpdateLowerBound}
          onUpdateUpperBound={handleUpdateUpperBound}
        />
      </Box>
    </Modal>
  );
};

export default BinModal;
