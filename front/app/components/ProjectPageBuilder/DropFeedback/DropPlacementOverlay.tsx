import React from 'react';

import { EditorState, Indicator, useEditor } from '@craftjs/core';

import DropIndicatorBar from './DropIndicatorBar';
import FixedZoneVeil from './FixedZoneVeil';
import getRefusalMessage from './getRefusalMessage';
import messages from './messages';
import useIsDragging from './useIsDragging';

// craft.js types the indicator as always present, but it stays null until the
// pointer enters a canvas.
const collectIndicator = (
  state: EditorState
): { indicator: Indicator | null } => ({ indicator: state.indicator });

const DropPlacementOverlay = () => {
  const isDragging = useIsDragging();
  const { indicator } = useEditor(collectIndicator);

  if (!isDragging || !indicator) return null;

  const { placement, error } = indicator;
  const refusalMessage = error === null ? null : getRefusalMessage(placement);

  return (
    <>
      {refusalMessage === messages.cannotDropInFixedHeader && <FixedZoneVeil />}
      <DropIndicatorBar placement={placement} refusalMessage={refusalMessage} />
    </>
  );
};

export default DropPlacementOverlay;
