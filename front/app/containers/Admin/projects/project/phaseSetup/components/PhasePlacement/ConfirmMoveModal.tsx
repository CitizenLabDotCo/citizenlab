import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import placementMessages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';
import MovePhaseSummary from 'containers/Admin/projects/_shared/components/PhasePlacement/MovePhaseSummary';
import usePhasePlacementMove from 'containers/Admin/projects/_shared/components/PhasePlacement/usePhasePlacementMove';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  phase: IPhaseData;
  onClose: () => void;
}

const ConfirmMoveModal = ({ phase, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const placementMove = usePhasePlacementMove(phase);
  const { onTimeline, loaded, blocked, move, isPending } = placementMove;

  return (
    <Modal
      opened
      close={onClose}
      width="450px"
      header={formatMessage(
        onTimeline
          ? placementMessages.moveToSpotlightSurveysTitle
          : placementMessages.moveToTimelineTitle
      )}
      closeOnClickOutside
    >
      <Box padding="20px">
        <MovePhaseSummary phase={phase} placementMove={placementMove} />
        <Box display="flex" gap="8px" mt="20px" flexDirection="column">
          {!blocked && (
            <Button
              onClick={() => move({ onSuccess: onClose })}
              disabled={!loaded}
              processing={isPending}
              data-cy="e2e-phase-placement-confirm"
            >
              {formatMessage(placementMessages.confirmButton)}
            </Button>
          )}
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            {formatMessage(placementMessages.cancelButton)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmMoveModal;
