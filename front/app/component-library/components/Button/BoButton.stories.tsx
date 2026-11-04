import React from 'react';

import { fn } from 'storybook/test';

import Box from '../Box';
import { IconNames } from '../Icon';
import Text from '../Text';
import { bo, colors } from '../../utils/styleUtils';

import Button, { ButtonStyles } from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The back-office buttons of the redesigned project pages: one 36px, 8px
// radius geometry in six colourings (primary, secondary, text, delete, the
// green "Live" status pill and the round picker pill), plus the 32px header
// size.

const STYLES: { style: ButtonStyles; label: string; icon: IconNames }[] = [
  { style: 'bo-primary', label: 'Save changes', icon: 'check' },
  { style: 'bo-secondary', label: 'Share', icon: 'share' },
  { style: 'bo-text', label: 'Preview', icon: 'eye' },
  { style: 'bo-delete', label: 'Delete', icon: 'delete' },
  { style: 'bo-status', label: 'Live', icon: 'chevron-down' },
  { style: 'bo-picker', label: 'In progress', icon: 'chevron-down' },
];

const Dot = () => (
  <Box
    as="span"
    display="inline-block"
    w="7px"
    h="7px"
    borderRadius="50%"
    background={colors.success}
  />
);

const label = (style: ButtonStyles, text: string) =>
  style === 'bo-status' ? (
    <Box as="span" display="flex" alignItems="center" gap="7px">
      <Dot />
      {text}
    </Box>
  ) : (
    text
  );

const iconRight = (style: ButtonStyles) =>
  style === 'bo-status' || style === 'bo-picker';

const Cell = ({ children }: { children: React.ReactNode }) => (
  <Box display="flex" alignItems="center">
    {children}
  </Box>
);

const Gallery = ({ size }: { size: 'regular' | 'header' }) => {
  const header =
    size === 'header'
      ? {
          height: bo.buttonMedium.height,
          padding: bo.buttonMedium.padding,
          fontSize: bo.buttonMedium.fontSize,
          iconSize: bo.buttonMedium.iconSize,
        }
      : {};

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px repeat(4, max-content)',
        alignItems: 'center',
        gap: 'var(--gv-space-4) var(--gv-space-6)',
        padding: 'var(--gv-space-6)',
        background: colors.white,
      }}
    >
      {['', 'Normal', 'Disabled', 'With icon', 'Processing'].map((h) => (
        <Text key={h} variant="boMicro" m="0px">
          {h}
        </Text>
      ))}
      {STYLES.map(({ style, label: text, icon }) => (
        <React.Fragment key={style}>
          <Text variant="boControl" m="0px">
            {style}
          </Text>
          <Cell>
            <Button buttonStyle={style} onClick={fn()} {...header}>
              {label(style, text)}
            </Button>
          </Cell>
          <Cell>
            <Button buttonStyle={style} disabled {...header}>
              {label(style, text)}
            </Button>
          </Cell>
          <Cell>
            <Button
              buttonStyle={style}
              icon={icon}
              iconPos={iconRight(style) ? 'right' : 'left'}
              {...header}
            >
              {label(style, text)}
            </Button>
          </Cell>
          <Cell>
            <Button buttonStyle={style} processing {...header}>
              {label(style, text)}
            </Button>
          </Cell>
        </React.Fragment>
      ))}
    </div>
  );
};

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office buttons',
  tags: ['bo', 'redesigned'],
  component: Button,
  args: { buttonStyle: 'bo-primary', children: 'Save changes', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All six back-office styles, normal, disabled, with an icon, processing. */
export const Default: Story = {
  render: () => <Gallery size="regular" />,
};

/** The same at the 32px header size (bo.buttonMedium, 13px text). */
export const HeaderSize: Story = {
  render: () => <Gallery size="header" />,
};

/** One primary button, to play with in the controls. */
export const Single: Story = {};

/** Square icon-only buttons as the header and panels use them. */
export const IconOnly: Story = {
  render: () => (
    <Box
      display="flex"
      alignItems="center"
      gap="8px"
      p="24px"
      background={colors.white}
    >
      <Text variant="boMicro" m="0px" mr="8px">
        Back, preview, settings, add
      </Text>
      <Button
        buttonStyle="bo-secondary"
        icon="arrow-left"
        width="32px"
        height="32px"
        padding="0"
        ariaLabel="Back"
      />
      <Button
        buttonStyle="bo-text"
        icon="eye"
        width="32px"
        height="32px"
        padding="0"
        ariaLabel="Preview"
      />
      <Button
        buttonStyle="bo-text"
        icon="settings"
        width="36px"
        height="36px"
        padding="0"
        ariaLabel="Settings"
      />
      <Button
        buttonStyle="bo-text"
        icon="plus"
        width="32px"
        height="32px"
        padding="0"
        ariaLabel="Add"
      />
    </Box>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  render: () => <Gallery size="regular" />,
};
