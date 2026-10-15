import React from 'react';

import {
  Box,
  Icon,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { ConnectDragSource } from 'react-dnd';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  // Left out when the item can't be dragged.
  handle?: ConnectDragSource;
  // Where it sits over its item, which has to be positioned.
  top: string;
  left: string;
}

// The grip an item is dragged by. It's for the pointer only: the keyboard
// moves items from "⋯ › Arrange", so it's hidden from assistive technology
// and takes no focus. It shows on hover, like the "⋯".
const DragHandle = ({ handle, top, left }: Props) => {
  const { formatMessage } = useIntl();

  if (!handle) return null;

  return (
    <Box
      data-grip
      aria-hidden
      position="absolute"
      top={top}
      left={left}
      zIndex="1"
    >
      <Tooltip
        content={formatMessage(messages.dragToArrange)}
        placement="top"
        theme="dark"
      >
        <Box
          ref={(node: HTMLDivElement | null) => {
            handle(node);
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="24px"
          height="24px"
          borderRadius={bo.borderRadius}
          bgColor={colors.grey50}
          cursor="grab"
        >
          <Icon
            name="drag-handle"
            width="16px"
            height="16px"
            fill={colors.coolGrey600}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default DragHandle;
