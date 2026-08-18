// The presentational pieces of the mode picker. Only this folder renders them.

import React, { ReactNode } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Color,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

/** Inline "this isn't possible because…" note shown next to disabled controls. */
export const Hint = ({ children }: { children: ReactNode }) => (
  <Box
    display="flex"
    alignItems="center"
    gap="6px"
    px="10px"
    py="6px"
    borderRadius={stylingConsts.borderRadius}
    bgColor={colors.grey50}
  >
    <Icon
      name="info-outline"
      width="14px"
      height="14px"
      fill={colors.coolGrey500}
    />
    <Text as="span" m="0" fontSize="xs" color="coolGrey600">
      {children}
    </Text>
  </Box>
);

/** A selectable card for the top-level access-mode choice. */
export const ModeCard = ({
  icon,
  title,
  description,
  descriptionColor = 'coolGrey600',
  selected,
  className,
  onClick,
}: {
  icon: IconNames;
  title: string;
  description: string;
  descriptionColor?: Color;
  selected: boolean;
  className?: string;
  onClick: () => void;
}) => (
  <Box
    as="button"
    type="button"
    flex="1 1 200px"
    p="12px"
    display="flex"
    alignItems="flex-start"
    gap="8px"
    borderRadius="8px"
    border={`1px solid ${selected ? colors.teal400 : colors.borderLight}`}
    bgColor={selected ? colors.teal50 : colors.white}
    style={{ cursor: 'pointer', textAlign: 'left' }}
    className={className}
    onClick={onClick}
  >
    {/* The icon is a flex child, so a long description would otherwise squeeze
        it narrower than its 20px — and by a different amount per card. The
        wrapper keeps every card's icon at the same size. */}
    <Box display="flex" flexShrink={0}>
      <Icon
        name={icon}
        width="20px"
        height="20px"
        fill={selected ? colors.teal500 : colors.coolGrey500}
      />
    </Box>
    <Box display="flex" flexDirection="column" gap="4px">
      <Text as="span" m="0" fontSize="s" fontWeight="bold" color="primary">
        {title}
      </Text>
      <Text as="span" m="0" fontSize="xs" color={descriptionColor}>
        {description}
      </Text>
    </Box>
  </Box>
);
