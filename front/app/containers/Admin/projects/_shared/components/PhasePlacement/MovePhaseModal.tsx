import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import Error from 'components/UI/Error';
import Modal, { MEDIUM_MODAL_WIDTH } from 'components/UI/Modal';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import placementMessages from './messages';
import styles from './MovePhase.module.css';
import MovePhaseDates from './MovePhaseDates';
import MovePhaseSummary from './MovePhaseSummary';
import PlacementButton from './PlacementButton';
import usePhasePlacementMove from './usePhasePlacementMove';
import 'design-system/tokens.css';

interface Props {
  phase: IPhaseData;
  onClose: () => void;
  onMoved?: (phase: IPhaseData) => void;
  hasUnsavedChanges?: boolean;
  variant?: 'default' | 'panel';
}

const MovePhaseModal = ({
  phase,
  onClose,
  onMoved,
  hasUnsavedChanges = false,
  variant = 'default',
}: Props) => {
  const redesign = variant === 'panel';
  const { formatMessage } = useIntl();
  const placementMove = usePhasePlacementMove(phase);
  const { onTimeline, loaded, blocked, move, isPending } = placementMove;
  const editingDates = !onTimeline && (blocked || placementMove.datesChanged);
  const close = () => {
    if (!isPending) onClose();
  };
  const confirm = () =>
    move({
      onSuccess: (updatedPhase) => {
        onMoved?.(updatedPhase);
        onClose();
      },
    });

  return (
    <Modal
      opened
      close={close}
      width={editingDates ? 760 : MEDIUM_MODAL_WIDTH}
      header={formatMessage(
        editingDates
          ? placementMessages.changeDatesButton
          : onTimeline
          ? placementMessages.moveToSpotlightSurveysTitle
          : placementMessages.moveToTimelineTitle
      )}
      footer={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap="8px"
          width="100%"
          flexWrap="wrap"
        >
          {blocked && (
            <p className={styles.status} role="status" aria-live="polite">
              {formatMessage(placementMessages.resolveDateConflicts, {
                count: placementMove.dateConflictCount,
              })}
            </p>
          )}
          {redesign ? (
            <>
              <Button isDisabled={isPending} onPress={close}>
                {formatMessage(placementMessages.cancelButton)}
              </Button>
              <Button
                variant="primary"
                isDisabled={!loaded || blocked || hasUnsavedChanges}
                isPending={isPending}
                data-cy="e2e-phase-placement-confirm"
                onPress={confirm}
              >
                {formatMessage(placementMessages.confirmButton)}
              </Button>
            </>
          ) : (
            <>
              <PlacementButton
                appearance="secondary"
                disabled={isPending}
                onClick={close}
              >
                {formatMessage(placementMessages.cancelButton)}
              </PlacementButton>
              <PlacementButton
                appearance="primary"
                disabled={!loaded || blocked || hasUnsavedChanges}
                processing={isPending}
                data-cy="e2e-phase-placement-confirm"
                onClick={confirm}
              >
                {formatMessage(placementMessages.confirmButton)}
              </PlacementButton>
            </>
          )}
        </Box>
      }
    >
      <Box p="24px">
        {hasUnsavedChanges && (
          <Text>{formatMessage(placementMessages.moveSaveChangesFirst)}</Text>
        )}
        {placementMove.loadFailed && (
          <Box role="alert" mb="16px">
            <Error text={formatMessage(placementMessages.loadFailed)} />
            {redesign ? (
              <Button
                isPending={placementMove.retrying}
                onPress={placementMove.retryLoading}
              >
                {formatMessage(placementMessages.retryLoading)}
              </Button>
            ) : (
              <PlacementButton
                appearance="secondary"
                processing={placementMove.retrying}
                onClick={placementMove.retryLoading}
              >
                {formatMessage(placementMessages.retryLoading)}
              </PlacementButton>
            )}
          </Box>
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
