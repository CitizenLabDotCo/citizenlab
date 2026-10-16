import React from 'react';

import {
  Box,
  Button,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import AnchoredLayer from './AnchoredLayer';
import FlyoutMenu, { MenuEntry } from './FlyoutMenu';
import useAnchoredMenu from './useAnchoredMenu';

interface Props {
  entries: MenuEntry[];
  align?: 'left' | 'right';
}

// "⋯": the actions on a level, a card or a row. Nothing shows without any.
const MoreActions = ({ entries, align }: Props) => {
  const { formatMessage } = useIntl();
  const { anchor, opened, toggle, close, layer, button } = useAnchoredMenu();
  const label = formatMessage(messages.moreActions);

  if (entries.length === 0) return null;

  return (
    <Box flex="none">
      <Tooltip
        content={label}
        placement="bottom"
        theme="dark"
        disabled={opened}
      >
        <Button
          ref={button}
          type="button"
          buttonStyle="bo-text"
          icon="dots-horizontal"
          iconSize="16px"
          iconColor={colors.coolGrey600}
          padding="4px"
          ariaLabel={label}
          ariaExpanded={opened}
          ariaHasPopup="menu"
          onClick={toggle}
        />
      </Tooltip>
      <AnchoredLayer anchor={anchor} layer={layer}>
        <FlyoutMenu
          label={label}
          opened
          onClose={close}
          entries={entries}
          top="calc(100% + 4px)"
          align={align}
        />
      </AnchoredLayer>
    </Box>
  );
};

export default MoreActions;
