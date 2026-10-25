import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import placementMessages from './messages';
import MovePhaseDates from './MovePhaseDates';
import MovePhaseSummary from './MovePhaseSummary';
import usePhasePlacementMove from './usePhasePlacementMove';

interface Props {
  phase: IPhaseData;
  onClose: () => void;
  onMoved?: (phase: IPhaseData) => void;
  hasUnsavedChanges?: boolean;
}

const MovePhaseModal = ({
  phase,
  onClose,
  onMoved,
  hasUnsavedChanges = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const placementMove = usePhasePlacementMove(phase);
  const { onTimeline, loaded, blocked, move, isPending } = placementMove;
  const editingDates = !onTimeline && (blocked || placementMove.datesChanged);
  const close = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      opened
      close={close}
      width={editingDates ? 680 : 560}
      header={formatMessage(
        editingDates
          ? placementMessages.changeDatesButton
          : onTimeline
          ? placementMessages.moveToSpotlightSurveysTitle
          : placementMessages.moveToTimelineTitle
      )}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button
            buttonStyle="bo-secondary"
            disabled={isPending}
            onClick={close}
          >
            {formatMessage(placementMessages.cancelButton)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            disabled={!loaded || blocked || hasUnsavedChanges}
            processing={isPending}
            data-cy="e2e-phase-placement-confirm"
            onClick={() =>
              move({
                onSuccess: (updatedPhase) => {
                  onMoved?.(updatedPhase);
                  onClose();
                },
              })
            }
          >
            {formatMessage(placementMessages.confirmButton)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        {hasUnsavedChanges && (
          <Text>{formatMessage(placementMessages.moveSaveChangesFirst)}</Text>
        )}
        <MovePhaseSummary
          phase={placementMove.draftPhase}
          placementMove={placementMove}
        />
        {editingDates && <MovePhaseDates placementMove={placementMove} />}
      </Box>
    </Modal>
  );
};

export default MovePhaseModal;
