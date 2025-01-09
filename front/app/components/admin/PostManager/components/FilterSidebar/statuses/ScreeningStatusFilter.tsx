import React from 'react';

import { IconTooltip, Box, Tooltip } from '@citizenlab/cl2-component-library';
import ColorIndicator from 'component-library/components/ColorIndicator';
import { useDrop } from 'react-dnd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ManagerType } from 'components/admin/PostManager';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

import StatusButton from './StatusButton';

const StatusText = styled.div`
  &:first-letter {
    text-transform: uppercase;
  }
`;

interface Props {
  status: IIdeaStatusData;
  active: boolean;
  onClick: () => void;
  type: ManagerType;
}

const ScreeningStatusFilter = ({ status, active, onClick, type }: Props) => {
  const { phaseId } = useParams() as { phaseId: string };
  const { data: phase } = usePhase(phaseId);
  const preScreeningFeatureFlag =
    phase?.data.attributes.participation_method === 'ideation'
      ? 'prescreening_ideation'
      : 'prescreening';
  const preScreeningFeatureAllowed = useFeatureFlag({
    name: preScreeningFeatureFlag,
    onlyCheckAllowed: true,
  });

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () => ({
      type: 'status',
      id: status.id,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Prescreening is a special status that can be configured in a project,
  // so we don't want to show it in a context without projects to not get status conflicts
  // (e.g. the general input manager has ideas from all projects,
  // including those without the prescreening status filter)
  if (type === 'AllIdeas') return null;

  const phasePrescreeningEnabled =
    phase?.data.attributes.prescreening_enabled === true;
  const showAutomaticStatusTooltip =
    status.attributes.can_manually_transition_to === false;
  const prescreeningButtonIsDisabled =
    !phasePrescreeningEnabled || !preScreeningFeatureAllowed;
  const prescreeningTooltipIsDisabled =
    phasePrescreeningEnabled && preScreeningFeatureAllowed;

  return (
    <div ref={drop}>
      <Tooltip
        content={
          <div>
            {!preScreeningFeatureAllowed ? (
              <FormattedMessage {...messages.prescreeningTooltipUpsell} />
            ) : (
              <FormattedMessage
                {...messages.prescreeningTooltipPhaseDisabled}
              />
            )}
          </div>
        }
        disabled={prescreeningTooltipIsDisabled}
      >
        <Box>
          <StatusButton
            onClick={onClick}
            active={active || (isOver && canDrop)}
            disabled={prescreeningButtonIsDisabled}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              w="100%"
            >
              <ColorIndicator bgColor={status.attributes.color} />
              <Box display="flex" alignItems="center" gap="4px">
                <StatusText>
                  <T value={status.attributes.title_multiloc} />
                </StatusText>
                {showAutomaticStatusTooltip && (
                  <IconTooltip
                    theme="light"
                    iconSize="16px"
                    content={
                      <FormattedMessage
                        {...messages.automatedStatusTooltipText}
                      />
                    }
                  />
                )}
              </Box>
            </Box>
          </StatusButton>
        </Box>
      </Tooltip>
    </div>
  );
};

export default ScreeningStatusFilter;
