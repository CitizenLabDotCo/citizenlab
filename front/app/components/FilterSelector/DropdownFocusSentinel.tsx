import React from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
}

// For accessibility: A hidden button to add after the menu to close the menu
// and focus on the correct element when swiping past the last item on mobile.
const DropdownFocusSentinel = ({ opened, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <button
      tabIndex={opened ? 0 : -1}
      aria-hidden={!opened}
      onFocus={() => onClose()}
      onClick={onClose}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {formatMessage(messages.closeMenu)}
    </button>
  );
};

export default DropdownFocusSentinel;
