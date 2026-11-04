import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';

export interface CardButton {
  icon: IconNames;
  onClick: () => void;
  actionLabel?: string;
  expanded?: boolean;
  disabled?: boolean;
}

interface Props {
  title: string;
  titleTooltip?: JSX.Element;
  action?: ReactNode;
  button: CardButton;
}

const SetupCardButton = ({ title, titleTooltip, action, button }: Props) => {
  const header = (
    <Box
      as="button"
      type="button"
      w="100%"
      minHeight="44px"
      display="flex"
      alignItems="center"
      gap="10px"
      p="8px 8px 8px 12px"
      background="transparent"
      border="none"
      borderRadius={bo.borderRadius}
      cursor={button.disabled ? 'default' : 'pointer'}
      aria-expanded={button.expanded}
      disabled={button.disabled}
      onClick={button.onClick}
    >
      <Box
        flex="1 1 auto"
        minWidth="0"
        display="flex"
        alignItems="center"
        gap="4px"
      >
        <Text
          as="span"
          variant="boControl"
          fontSize="xs"
          m="0"
          textAlign="left"
        >
          {title}
          {button.actionLabel && (
            <ScreenReaderOnly>{`, ${button.actionLabel}`}</ScreenReaderOnly>
          )}
        </Text>
        {titleTooltip && (
          <Icon
            name="info-solid"
            width="20px"
            height="20px"
            fill={colors.textSecondary}
            ariaHidden
          />
        )}
      </Box>
      {action}
      <Box
        flex="0 0 auto"
        w="28px"
        h="28px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <Icon
          name={button.icon}
          width="16px"
          height="16px"
          fill={colors.coolGrey500}
        />
      </Box>
    </Box>
  );

  // A tooltip icon is a button of its own and can't sit inside the header
  // button, so the whole header carries the tooltip instead.
  if (!titleTooltip) return header;

  return (
    <Tooltip content={titleTooltip} theme="dark" width="100%">
      {header}
    </Tooltip>
  );
};

export default SetupCardButton;
