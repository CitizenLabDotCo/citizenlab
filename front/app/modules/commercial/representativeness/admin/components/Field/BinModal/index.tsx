import React, { useState, useEffect } from 'react';

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
  getExampleBins,
  isExampleBins,
  validateBins,
  updateLowerBound,
  updateUpperBound,
  removeBin,
  addBin,
} from './utils';
import { isEqual } from 'lodash-es';

// typings
import { Bins } from '../../../services/referenceDistribution';

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
  bins?: Bins;
  onClose: () => void;
  onSave: (bins: Bins) => void;
}

const BinModal = ({ open, bins, onClose, onSave }: Props) => {
  const [currentBins, setCurrentBins] = useState(bins ?? getExampleBins());
  const [saveScheduled, setSaveScheduled] = useState(false);

  const handleUpdateLowerBound = (
    binIndex: number,
    newValue: number | null
  ) => {
    setCurrentBins((bins) => updateLowerBound(bins, binIndex, newValue));
  };

  const handleUpdateUpperBound = (newValue: number | null) => {
    setCurrentBins((bins) => updateUpperBound(bins, newValue));
  };

  const resetAll = () => {
    setCurrentBins((bins) => Array(bins.length).fill(null));
  };

  const applyExampleGrouping = () => {
    setCurrentBins(getExampleBins());
  };

  const handleRemoveBin = () => {
    setCurrentBins((bins) => removeBin(bins));
  };

  const handleAddBin = () => {
    setCurrentBins((bins) => addBin(bins));
  };

  const saveAndClose = () => {
    if (!isEqual(bins, currentBins)) {
      onSave(currentBins);
    }

    onClose();
  };

  const handleSave = () => {
    const activeElement = document.activeElement;

    if (activeElement && activeElement.className === 'bin-input') {
      (activeElement as HTMLElement)?.blur();

      setTimeout(() => {
        setSaveScheduled(true);
      }, 10);
    } else {
      saveAndClose();
    }
  };

  // This is only triggered if one of the bin inputs was focussed
  // the moment 'Save' was clicked. Because the bin input value
  // is only updated on blur, we first need to trigger blur and wait
  // for the next state update. This forces React to wait for the
  // next state update.
  useEffect(() => {
    if (!saveScheduled) return;
    setSaveScheduled(false);
    saveAndClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveScheduled]);

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
            {!isExampleBins(currentBins) && (
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
          bins={currentBins}
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
            disabled={!validateBins(currentBins)}
            data-testid="bin-save-button"
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BinModal;
