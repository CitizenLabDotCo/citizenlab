import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import { Box, Icon, Text, Button } from '@citizenlab/cl2-component-library';
import BinInputs from './BinInputs';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import {
  validateBins,
  allBinsEmpty,
  updateLowerBound,
  updateUpperBound,
  removeBin,
  addBin,
} from './utils';

const ClearAllButton = styled.button`
  cursor: pointer;
`;

const ApplyExampleGroupingButton = styled.button`
  cursor: pointer;
`;

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (bins: Bins) => void;
}

export type Bins = (number | null)[];

// TODO delete this when real data is available
export const getDummyBins = (): Bins => [18, 25, 35, 45, 55, 65, null];

const BinModal = ({ open, onClose, onSave }: Props) => {
  const [bins, setBins] = useState(getDummyBins());

  const handleUpdateLowerBound = (
    binIndex: number,
    newValue: number | null
  ) => {
    setBins((bins) => updateLowerBound(bins, binIndex, newValue));
  };

  const handleUpdateUpperBound = (newValue: number | null) => {
    setBins((bins) => updateUpperBound(bins, newValue));
  };

  const resetAll = () => {
    setBins((bins) => Array(bins.length).fill(null));
  };

  const applyExampleGrouping = () => {
    setBins(getDummyBins());
  };

  const handleRemoveBin = () => {
    setBins((bins) => removeBin(bins));
  };

  const handleAddBin = () => {
    setBins((bins) => addBin(bins));
  };

  const handleSave = () => {
    onSave(bins);
    onClose();
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
        <Box display="flex" justifyContent="space-between">
          <FormattedMessage {...messages.modalDescription} />
          <Box
            display="flex"
            flexDirection="row-reverse"
            justifyContent="flex-end"
          >
            <ClearAllButton onClick={resetAll}>
              <Text variant="bodyS" mt="0px" mb="0px" color="red600">
                <FormattedMessage {...messages.clearAll} />
              </Text>
            </ClearAllButton>
            {allBinsEmpty(bins) && (
              <ApplyExampleGroupingButton onClick={applyExampleGrouping}>
                <Text variant="bodyS" mt="0px" mb="0px" color="label">
                  <StyledIcon
                    name="groups2"
                    height="10px"
                    width="14px"
                    mr="6px"
                    fill={colors.label}
                  />
                  <FormattedMessage {...messages.applyExampleGrouping} />
                </Text>
              </ApplyExampleGroupingButton>
            )}
          </Box>
        </Box>
        <BinInputs
          bins={bins}
          onUpdateLowerBound={handleUpdateLowerBound}
          onUpdateUpperBound={handleUpdateUpperBound}
          onRemoveBin={handleRemoveBin}
        />

        <Button
          icon="plus-circle"
          mt="16px"
          buttonStyle="secondary"
          onClick={handleAddBin}
        >
          <FormattedMessage {...messages.addAnAgeGroup} />
        </Button>

        <Box display="flex" justifyContent="flex-start" mt="28px">
          <Button
            width="auto"
            onClick={handleSave}
            disabled={!validateBins(bins)}
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BinModal;
