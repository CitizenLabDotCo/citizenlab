import React from 'react';

import {
  IconTooltip,
  Box,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';

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
  status: IIdeaStatusData | IInitiativeStatusData;
  active: boolean;
  onClick: () => void;
}

const FilterSidebarStatusesItem = ({ status, active, onClick }: Props) => {
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

  const showTooltip =
    (status as IInitiativeStatusData).attributes.transition_type ===
      'automatic' ||
    (status as IIdeaStatusData).attributes.can_manually_transition_to === false;
  return (
    <div ref={drop}>
      <Button
        onClick={onClick}
        buttonStyle="text"
        bgColor={
          active || (isOver && canDrop) ? colors.background : 'transparent'
        }
        justify="left"
        bgHoverColor={colors.background}
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
            {showTooltip && (
              <IconTooltip
                iconSize="16px"
                content={
                  <FormattedMessage {...messages.automatedStatusTooltipText} />
                }
              />
            )}
          </Box>
        </Box>
      </Button>
    </div>
  );
};

export default FilterSidebarStatusesItem;
