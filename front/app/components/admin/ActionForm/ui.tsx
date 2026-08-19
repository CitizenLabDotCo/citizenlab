// Small presentational building blocks shared across the panel. Kept here so
// the section components read top-to-bottom as layout.

import React, { ReactNode, useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  IconTooltip,
  colors,
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

const CHIP_COLORS = { bg: colors.grey100, fg: colors.grey700 };

/** A compact pill used in the collapsed summary row. */
export const Chip = ({ chip }: { chip: SummaryChip }) => {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="8px"
      py="2px"
      borderRadius="4px"
      bgColor={CHIP_COLORS.bg}
    >
      <Icon name={chip.icon} width="12px" height="12px" fill={CHIP_COLORS.fg} />
      <Text
        as="span"
        m="0"
        fontSize="xs"
        fontWeight="semi-bold"
        color="coolGrey700"
      >
        {chip.label}
      </Text>
    </Box>
  );
};

/**
 * A single progressive-disclosure row: collapsed it shows just a title + a
 * muted one-line summary of its current value; expanded it reveals its
 * controls. This is the main tool against "the interface is too full" — every
 * optional setting hides behind one of these until the admin opens it.
 *
 * When `locked` is set the row is disabled: it can't be expanded, its children
 * are never rendered, and a lock icon with a tooltip (`lockedTooltip`) explains
 * why. Used to gate a section behind the tenant's pricing plan.
 */
export const Expander = ({
  icon,
  title,
  summary,
  children,
  defaultOpen = false,
  locked = false,
  lockedTooltip,
  dataCy,
}: {
  icon: IconNames;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  locked?: boolean;
  lockedTooltip?: string;
  dataCy?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  if (locked) {
    return (
      <Box data-cy={dataCy}>
        <Box w="100%" display="flex" alignItems="center" gap="10px" py="12px">
          <Icon
            name="chevron-right"
            width="16px"
            height="16px"
            fill={colors.coolGrey300}
          />
          <Icon
            name={icon}
            width="16px"
            height="16px"
            fill={colors.coolGrey300}
          />
          <Text
            as="span"
            m="0"
            fontSize="s"
            fontWeight="semi-bold"
            color="coolGrey500"
          >
            {title}
          </Text>
          {lockedTooltip && (
            <IconTooltip
              icon="lock"
              iconSize="16px"
              iconColor={colors.coolGrey500}
              content={lockedTooltip}
            />
          )}
          <Box flex="1 1 auto" />
        </Box>
      </Box>
    );
  }

  return (
    <Box data-cy={dataCy}>
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
        <Icon
          name={icon}
          width="16px"
          height="16px"
          fill={colors.coolGrey600}
        />
        <Text
          as="span"
          m="0"
          fontSize="s"
          fontWeight="semi-bold"
          color="primary"
        >
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
