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

export type Bins = [number, number][];

// TODO delete this when actual data is in place
const getDummyBins = (): Bins => [
  [18, 24],
  [25, 34],
  [35, 44],
  [45, 54],
  [55, 64],
  [65, Infinity],
];

const BinModal = ({ open, onClose }: Props) => {
  const [bins, setBins] = useState(getDummyBins());

  const handleUpdateLowerBound = (groupIndex: number, newValue: number) => {
    setBins((bins) => updateLowerBound(bins, groupIndex, newValue));
  };

  const handleUpdateUpperBound = (newValue: number) => {
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
