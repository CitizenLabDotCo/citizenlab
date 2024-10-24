import React from 'react';

import {
  IconTooltip,
  Box,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const ColorIndicator = styled.div`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.color};
  border-radius: ${(props) => props.theme.borderRadius};
  margin-right: 0.5rem;
`;

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
  const phasePrescreeningEnabled =
    phase?.data.attributes.prescreening_enabled === true;

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

  const showAutomaticStatusTooltip =
    status.attributes.can_manually_transition_to === false;

  const prescreeningButtonIsDisabled =
    status.attributes.code === 'prescreening' &&
    (!phasePrescreeningEnabled || !preScreeningFeatureAllowed);

  const prescreeningTooltipIsDisabled =
    status.attributes.code !== 'prescreening' ||
    (phasePrescreeningEnabled && preScreeningFeatureAllowed);

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
          <Button
            onClick={onClick}
            buttonStyle="text"
            bgColor={
              active || (isOver && canDrop) ? colors.background : 'transparent'
            }
            justify="left"
            bgHoverColor={colors.background}
            disabled={prescreeningButtonIsDisabled}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              w="100%"
            >
              <ColorIndicator color={status.attributes.color} />
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
          </Button>
        </Box>
      </Tooltip>
    </div>
  );
};

export default FilterSidebarStatusesItem;
