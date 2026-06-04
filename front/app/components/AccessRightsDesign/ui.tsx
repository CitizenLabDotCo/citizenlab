// Design prototype – small presentational building blocks shared across the
// panel. Kept here so the section components read top-to-bottom as layout.

import React, { ReactNode, useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  IconTooltip,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { SummaryChip } from './logic';

/** A muted, all-caps section label with an icon and optional helper tooltip. */
export const SectionHeader = ({
  icon,
  title,
  tooltip,
}: {
  icon: IconNames;
  title: string;
  tooltip?: string;
}) => (
  <Box display="flex" alignItems="center" gap="8px" mb="12px">
    <Icon name={icon} width="18px" height="18px" fill={colors.coolGrey600} />
    <Text
      as="span"
      m="0"
      fontSize="xs"
      fontWeight="bold"
      color="coolGrey600"
      style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}
    >
      {title}
    </Text>
    {tooltip && <IconTooltip content={tooltip} iconSize="14px" />}
  </Box>
);

const CHIP_TONES: Record<SummaryChip['tone'], { bg: string; fg: string }> = {
  access: { bg: colors.teal50, fg: colors.teal700 },
  data: { bg: colors.grey100, fg: colors.grey700 },
  open: { bg: colors.green100, fg: colors.green700 },
};

/** A compact pill used in the collapsed summary row. */
export const Chip = ({ chip }: { chip: SummaryChip }) => {
  const tone = CHIP_TONES[chip.tone];
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="8px"
      py="2px"
      borderRadius="4px"
      bgColor={tone.bg}
    >
      <Icon name={chip.icon} width="12px" height="12px" fill={tone.fg} />
      <Text as="span" m="0" fontSize="xs" fontWeight="semi-bold" color="coolGrey700">
        {chip.label}
      </Text>
    </Box>
  );
};

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
    <Icon name="info-outline" width="14px" height="14px" fill={colors.coolGrey500} />
    <Text as="span" m="0" fontSize="xs" color="coolGrey600">
      {children}
    </Text>
  </Box>
);

/**
 * A single progressive-disclosure row: collapsed it shows just a title + a
 * muted one-line summary of its current value; expanded it reveals its
 * controls. This is the main tool against "the interface is too full" — every
 * optional setting hides behind one of these until the admin opens it.
 */
export const Expander = ({
  icon,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  icon: IconNames;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box>
      <Box
        as="button"
        type="button"
        w="100%"
        display="flex"
        alignItems="center"
        gap="10px"
        py="12px"
        background="transparent"
        style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon
          name={open ? 'chevron-down' : 'chevron-right'}
          width="16px"
          height="16px"
          fill={colors.coolGrey600}
        />
        <Icon name={icon} width="16px" height="16px" fill={colors.coolGrey600} />
        <Text as="span" m="0" fontSize="s" fontWeight="semi-bold" color="primary">
          {title}
        </Text>
        <Box flex="1 1 auto" />
        {!open && (
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {summary}
          </Text>
        )}
      </Box>
      {open && (
        <Box pl="26px" pb="14px">
          {children}
        </Box>
      )}
    </Box>
  );
};
