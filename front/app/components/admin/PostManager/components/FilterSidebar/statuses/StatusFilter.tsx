import React from 'react';

import { IconTooltip, Box } from '@citizenlab/cl2-component-library';
import ColorIndicator from 'component-library/components/ColorIndicator';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';

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

const StatusFilter = ({ status, active, onClick }: Props) => {
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

  return (
    <div ref={drop}>
      <Box>
        <StatusButton onClick={onClick} active={active || (isOver && canDrop)}>
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
    </div>
  );
};

export default StatusFilter;
