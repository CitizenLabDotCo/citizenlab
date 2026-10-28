import React from 'react';

import Box from '../Box';

import Icon, { icons, IconNames } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Data display/Icon',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IdeaIcon: Story = {
  args: {
    name: 'idea',
  },
};

interface IconWithNameProps {
  name: IconNames;
}

const IconWithName = ({ name }: IconWithNameProps) => {
  return (
    <Box display="flex">
      <Box width="200px">{name}</Box>
      <Box>
        <Icon name={name} width="20px" height="20px" />
      </Box>
    </Box>
  );
};

export const AllIcons: Story = {
  args: {
    name: 'idea',
  },
  render: () => (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      height="100%"
      position="absolute"
      top="40px"
      bottom="0px"
    >
      {Object.keys(icons)
        .sort()
        .map((iconName) => (
          <IconWithName key={iconName} name={iconName as IconNames} />
        ))}
      <Box bgColor="red">End</Box>
    </Box>
  ),
};

export const Default: Story = {
  args: {
    name: 'idea',
    width: '32px',
    height: '32px',
  },
};

const GALLERY_ICONS: IconNames[] = [
  'idea',
  'info-outline',
  'settings',
  'chevron-down',
  'search',
  'close',
  'check',
  'delete',
];

export const Gallery: Story = {
  args: Default.args,
  render: () => (
    <Box display="flex" gap="16px" flexWrap="wrap">
      {GALLERY_ICONS.map((name) => (
        <Icon key={name} name={name} width="24px" height="24px" />
      ))}
    </Box>
  ),
};
