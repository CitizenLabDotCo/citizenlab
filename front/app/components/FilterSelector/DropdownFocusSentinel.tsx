import React from 'react';

import { invisibleA11yText } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const HiddenButton = styled.button`
  ${invisibleA11yText()}
`;

interface Props {
  opened: boolean;
  onClose: () => void;
}

// For accessibility: A hidden button to add after the menu to close the menu
// and focus on the correct element when swiping past the last item on mobile.
const DropdownFocusSentinel = ({ opened, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <HiddenButton
      tabIndex={opened ? 0 : -1}
      aria-hidden={!opened}
      onFocus={() => onClose()}
      onClick={onClose}
    >
      {formatMessage(messages.closeMenu)}
    </HiddenButton>
  );
};

export default DropdownFocusSentinel;
