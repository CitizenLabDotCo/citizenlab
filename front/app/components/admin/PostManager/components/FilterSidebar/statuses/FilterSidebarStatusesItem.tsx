import React from 'react';

import { IconTooltip, Box, Tooltip } from '@citizenlab/cl2-component-library';
import ColorIndicator from 'component-library/components/ColorIndicator';
import { useDrop } from 'react-dnd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

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
}

const FilterSidebarStatusesItem = ({ status, active, onClick }: Props) => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);
  const preScreeningFeatureFlag =
    phase?.data.attributes.participation_method === 'ideation'
      ? 'prescreening_ideation'
      : 'prescreening';
  const preScreeningFeatureEnabled = useFeatureFlag({
    name: preScreeningFeatureFlag,
  });
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

  const phasePrescreeningEnabled =
    phase?.data.attributes.prescreening_enabled === true;
  const showAutomaticStatusTooltip =
    status.attributes.can_manually_transition_to === false;
  const prescreeningIsEnabled =
    status.attributes.code === 'prescreening' &&
    phasePrescreeningEnabled &&
    preScreeningFeatureEnabled;
  const isEnabled = prescreeningIsEnabled || true;
  const prescreeningTooltipIsDisabled = !prescreeningIsEnabled;

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
            disabled={!isEnabled}
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

export default FilterSidebarStatusesItem;
