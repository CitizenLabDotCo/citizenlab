import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import { waitForText } from '../../../../.storybook/mocks/backofficeRedesign';

import RailTooltip from './RailTooltip';

// The dark tooltip that names each icon of the collapsed admin rail on
// project pages. Here on a stand-in of the 80px rail: hover an icon and its
// name shows to the right.

const ITEMS: { icon: IconNames; label: string }[] = [
  { icon: 'sidebar-dashboards', label: 'Dashboard' },
  { icon: 'sidebar-folder', label: 'Projects' },
  { icon: 'sidebar-input-manager', label: 'Input manager' },
  { icon: 'sidebar-users', label: 'Users' },
  { icon: 'sidebar-messaging', label: 'Messaging' },
  { icon: 'sidebar-settings', label: 'Settings' },
];

const RailIcon = ({ icon, label }: { icon: IconNames; label: string }) => (
  <Box
    as="button"
    type="button"
    aria-label={label}
    w="56px"
    h="44px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    border="none"
    borderRadius="3px"
    background="transparent"
    style={{ cursor: 'pointer' }}
  >
    <Icon name={icon} height="20px" fill={colors.coolGrey300} />
  </Box>
);

const Rail = ({ disabled }: { disabled: boolean }) => (
  <Box
    w="80px"
    h="420px"
    pt="16px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    gap="4px"
    background="#003349"
  >
    {ITEMS.map((item) => (
      <RailTooltip key={item.icon} label={item.label} disabled={disabled}>
        <RailIcon {...item} />
      </RailTooltip>
    ))}
  </Box>
);

const meta = {
  title: 'Components/Redesigned/Shared pieces/Admin rail tooltip',
  tags: ['bo', 'redesigned'],
  component: RailTooltip,
  args: {
    label: 'Projects',
    disabled: false,
    children: <RailIcon icon="sidebar-folder" label="Projects" />,
  },
  render: (args) => <Rail disabled={args.disabled} />,
  decorators: [
    (Story) => (
      <Box w="320px" background={colors.grey100}>
        <Text variant="boMicro" m="0px" p="8px">
          Collapsed admin rail
        </Text>
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      within(canvasElement).getByRole('button', { name: 'Projects' })
    );
    await waitForText(document.body, 'Projects');
  },
} satisfies Meta<typeof RailTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The collapsed rail with the Projects icon hovered. */
export const Default: Story = {};

/** The rail without hover: icons only. */
export const Idle: Story = {
  play: async () => undefined,
};

/** Expanded rail: the tooltip is switched off. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      within(canvasElement).getByRole('button', { name: 'Projects' })
    );
  },
};
