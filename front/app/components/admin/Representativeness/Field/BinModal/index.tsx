import React, { useState, useEffect } from 'react';

import {
  Box,
  Icon,
  Text,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
import styled from 'styled-components';

import { Bins } from 'api/reference_distribution/types';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import {
  getExampleBins,
  updateLowerBound,
  updateUpperBound,
  removeBin,
  addBin,
  isExampleBins,
  validateBins,
} from 'utils/representativeness/bins';

import BinInputs from './BinInputs';
import messages from './messages';

const ClearAllButton = styled.button`
  cursor: pointer;

  p {
    color: ${colors.red600};
    &:hover {
      color: ${colors.red800};
    }
  }
`;

const ApplyExampleGroupingButton = styled.button`
  cursor: pointer;

  p {
    color: ${colors.textSecondary};
    &:hover {
      color: ${colors.textPrimary};
    }
  }

  svg {
    fill: ${colors.textSecondary};
    &:hover {
      fill: ${colors.textPrimary};
    }
  }
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const upperBound = currentBins[currentBins.length - 1];

  return (
    <Modal
      opened={open}
      close={onClose}
      width="70%"
      header={
        <Box color={colors.primary} style={{ fontWeight: 700 }}>
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
              <Text variant="bodyS" mt="0px" mb="0px">
                <FormattedMessage {...messages.clearAll} />
              </Text>
            </ClearAllButton>
            {!isExampleBins(currentBins) && (
              <ApplyExampleGroupingButton onClick={applyExampleGrouping}>
                <Text variant="bodyS" mt="0px" mb="0px">
                  <StyledIcon
                    name="group"
                    height="16px"
                    width="16px"
                    mr="6px"
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
          buttonStyle="secondary-outlined"
          data-testid="add-new-bin-button"
          onClick={handleAddBin}
        >
          <FormattedMessage {...messages.addAnAgeGroup} />
        </Button>

        {upperBound !== null && (
          <Box mt="20px">
            <Warning>
              <FormattedMessage
                {...messages.ageGroupNotIncluded}
                values={{ upperBound: upperBound + 1 }}
              />
            </Warning>
          </Box>
        )}

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
