import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Placement } from '@craftjs/core';
import { MessageDescriptor } from 'react-intl';

import { OVERLAY_Z_INDEX } from './constants';
import DropIndicatorCap from './DropIndicatorCap';
import DropIndicatorChip from './DropIndicatorChip';
import getIndicatorRect, { INDICATOR_THICKNESS } from './getIndicatorRect';
import messages from './messages';

type Props = {
  placement: Placement;
  refusalMessage: MessageDescriptor | null;
};

const DropIndicatorBar = ({ placement, refusalMessage }: Props) => {
  const rect = getIndicatorRect(placement);

  if (!rect) return null;

  const color = refusalMessage ? colors.red600 : colors.green500;

  return (
    <Box
      position="fixed"
      top={`${rect.top}px`}
      left={`${rect.left}px`}
      width={`${rect.width}px`}
      height={`${rect.height}px`}
      bgColor={color}
      borderRadius={`${INDICATOR_THICKNESS / 2}px`}
      zIndex={OVERLAY_Z_INDEX}
      pointerEvents="none"
      data-cy="drop-indicator-bar"
    >
      <DropIndicatorCap color={color} vertical={rect.vertical} atEnd={false} />
      <DropIndicatorCap color={color} vertical={rect.vertical} atEnd />
      <DropIndicatorChip
        message={refusalMessage ?? messages.placeHere}
        color={color}
        refused={refusalMessage !== null}
      />
    </Box>
  );
};

export default DropIndicatorBar;
