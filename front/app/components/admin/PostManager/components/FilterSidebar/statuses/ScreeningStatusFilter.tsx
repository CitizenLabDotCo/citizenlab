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
  const preScreeningFeatureEnabled = useFeatureFlag({
    name: preScreeningFeatureFlag,
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

  // Do not show the Screening status in the general input manager,
  // as this filter is configured at a project level.
  if (type === 'AllIdeas') return null;

  const showAutomaticStatusTooltip =
    status.attributes.can_manually_transition_to === false;

  const phasePrescreeningEnabled =
    phase?.data.attributes.prescreening_enabled === true;
  // Checking for the phase setting is enough here.
  // We don't need to check for the feature flag here. We check if something is enabled at the configuration level,
  // which means the phase setting in this case.
  const prescreeningButtonIsDisabled = !phasePrescreeningEnabled;

  const showPrescreeningPhaseSettingIsDisabledTooltip =
    // If the feature is enabled
    preScreeningFeatureEnabled &&
    // and it's not enabled for this phase, show this tooltip to inform.
    !phasePrescreeningEnabled;
  // If the feature is not commercially allowed, show the upsell tooltip
  const showPrescreeningUpsellTooltip = !preScreeningFeatureAllowed;
  // This is messy and the component should probably be split in a real and dummy component (when the feature is not allowed)
  const tooltipEnabled =
    showPrescreeningPhaseSettingIsDisabledTooltip ||
    showPrescreeningUpsellTooltip;

  return (
    <div ref={drop}>
      <Tooltip
        content={
          // We can't have both tooltips at the same time: if the upsell tooltip is shown,
          // the phase setting tooltip should not be shown.
          // The feature needs to be allowed before the phase setting is even visible.
          <div>
            {showPrescreeningUpsellTooltip && (
              <FormattedMessage {...messages.prescreeningTooltipUpsell} />
            )}
            {showPrescreeningPhaseSettingIsDisabledTooltip && (
              <FormattedMessage
                {...messages.prescreeningTooltipPhaseDisabled}
              />
            )}
          </div>
        }
        disabled={!tooltipEnabled}
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
