import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import placementMessages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';
import MovePhaseSummary from 'containers/Admin/projects/_shared/components/PhasePlacement/MovePhaseSummary';
import usePhasePlacementMove from 'containers/Admin/projects/_shared/components/PhasePlacement/usePhasePlacementMove';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
  phase: IPhaseData;
  onClose: () => void;
}

const MovePhaseModal = ({ projectId, phase, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const placementMove = usePhasePlacementMove(phase);
  const { onTimeline, loaded, blocked, move, isPending } = placementMove;

  return (
    <Modal
      opened
      close={onClose}
      width={560}
      header={formatMessage(
        onTimeline
          ? placementMessages.moveToSpotlightSurveysTitle
          : placementMessages.moveToTimelineTitle
      )}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-secondary" onClick={onClose}>
            {formatMessage(placementMessages.cancelButton)}
          </Button>
          {blocked ? (
            <ButtonWithLink
              buttonStyle="bo-primary"
              to="/admin/projects/$projectId/phases/$phaseId/setup"
              params={{ projectId, phaseId: phase.id }}
            >
              {formatMessage(placementMessages.changeDatesButton)}
            </ButtonWithLink>
          ) : (
            <Button
              buttonStyle="bo-primary"
              disabled={!loaded}
              processing={isPending}
              data-cy="e2e-phase-placement-confirm"
              onClick={() => move({ onSuccess: onClose })}
            >
              {formatMessage(placementMessages.confirmButton)}
            </Button>
          )}
        </Box>
      }
    >
      <Box p="24px">
        <MovePhaseSummary phase={phase} placementMove={placementMove} />
      </Box>
    </Modal>
  );
};

export default MovePhaseModal;
